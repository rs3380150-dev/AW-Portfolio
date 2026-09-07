import { useEffect, useRef } from "react";

const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const PRESSURE_ITERATIONS = 18;

const vertexShader = `#version 300 es
  in vec2 a_position;
  out vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const advectionShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_source;
  uniform vec2 u_texel;
  uniform float u_dt;
  uniform float u_dissipation;
  out vec4 out_color;

  void main() {
    vec2 previous = v_uv - u_dt * texture(u_velocity, v_uv).xy * u_texel;
    out_color = u_dissipation * texture(u_source, previous);
  }
`;

const splatShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_target;
  uniform vec2 u_point;
  uniform vec3 u_color;
  uniform float u_radius;
  uniform float u_aspect;
  out vec4 out_color;

  void main() {
    vec2 offset = v_uv - u_point;
    offset.x *= u_aspect;
    float falloff = exp(-dot(offset, offset) / u_radius);
    vec3 base = texture(u_target, v_uv).xyz;
    out_color = vec4(base + falloff * u_color, 1.0);
  }
`;

const divergenceShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  out vec4 out_color;

  void main() {
    float left = texture(u_velocity, v_uv - vec2(u_texel.x, 0.0)).x;
    float right = texture(u_velocity, v_uv + vec2(u_texel.x, 0.0)).x;
    float bottom = texture(u_velocity, v_uv - vec2(0.0, u_texel.y)).y;
    float top = texture(u_velocity, v_uv + vec2(0.0, u_texel.y)).y;
    vec2 center = texture(u_velocity, v_uv).xy;

    if (v_uv.x < u_texel.x) left = -center.x;
    if (v_uv.x > 1.0 - u_texel.x) right = -center.x;
    if (v_uv.y < u_texel.y) bottom = -center.y;
    if (v_uv.y > 1.0 - u_texel.y) top = -center.y;

    out_color = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
  }
`;

const curlShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  out vec4 out_color;

  void main() {
    float left = texture(u_velocity, v_uv - vec2(u_texel.x, 0.0)).y;
    float right = texture(u_velocity, v_uv + vec2(u_texel.x, 0.0)).y;
    float bottom = texture(u_velocity, v_uv - vec2(0.0, u_texel.y)).x;
    float top = texture(u_velocity, v_uv + vec2(0.0, u_texel.y)).x;
    out_color = vec4(right - left - top + bottom, 0.0, 0.0, 1.0);
  }
`;

const vorticityShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_velocity;
  uniform sampler2D u_curl;
  uniform vec2 u_texel;
  uniform float u_strength;
  uniform float u_dt;
  out vec4 out_color;

  void main() {
    float left = texture(u_curl, v_uv - vec2(u_texel.x, 0.0)).x;
    float right = texture(u_curl, v_uv + vec2(u_texel.x, 0.0)).x;
    float bottom = texture(u_curl, v_uv - vec2(0.0, u_texel.y)).x;
    float top = texture(u_curl, v_uv + vec2(0.0, u_texel.y)).x;
    float center = texture(u_curl, v_uv).x;
    vec2 force = 0.5 * vec2(abs(top) - abs(bottom), abs(left) - abs(right));
    force /= length(force) + 0.0001;
    force *= u_strength * center;
    force.y *= -1.0;

    vec2 velocity = texture(u_velocity, v_uv).xy + force * u_dt;
    out_color = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
  }
`;

const pressureShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_pressure;
  uniform sampler2D u_divergence;
  uniform vec2 u_texel;
  out vec4 out_color;

  void main() {
    float left = texture(u_pressure, v_uv - vec2(u_texel.x, 0.0)).x;
    float right = texture(u_pressure, v_uv + vec2(u_texel.x, 0.0)).x;
    float bottom = texture(u_pressure, v_uv - vec2(0.0, u_texel.y)).x;
    float top = texture(u_pressure, v_uv + vec2(0.0, u_texel.y)).x;
    float divergence = texture(u_divergence, v_uv).x;
    out_color = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const gradientShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_pressure;
  uniform sampler2D u_velocity;
  uniform vec2 u_texel;
  out vec4 out_color;

  void main() {
    float left = texture(u_pressure, v_uv - vec2(u_texel.x, 0.0)).x;
    float right = texture(u_pressure, v_uv + vec2(u_texel.x, 0.0)).x;
    float bottom = texture(u_pressure, v_uv - vec2(0.0, u_texel.y)).x;
    float top = texture(u_pressure, v_uv + vec2(0.0, u_texel.y)).x;
    vec2 velocity = texture(u_velocity, v_uv).xy;
    velocity -= 0.5 * vec2(right - left, top - bottom);
    out_color = vec4(velocity, 0.0, 1.0);
  }
`;

const clearShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_texture;
  uniform float u_value;
  out vec4 out_color;

  void main() {
    out_color = u_value * texture(u_texture, v_uv);
  }
`;

const displayShader = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  uniform sampler2D u_texture;
  out vec4 out_color;

  void main() {
    vec3 color = texture(u_texture, v_uv).rgb;
    float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);
    color += color * color * 0.12;
    out_color = vec4(color, alpha);
  }
`;

const colorToRgb = (value) => {
  const normalized = value.replace("#", "");
  const hex = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  const parsed = Number.parseInt(hex, 16);

  if (!Number.isFinite(parsed)) return [0.04, 0.58, 0.86];
  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255,
  ];
};

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Fluid shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
};

const createProgram = (gl, fragmentSource) => {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Fluid shader linking failed";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return {
    program,
    uniform: (name) => gl.getUniformLocation(program, name),
  };
};

const getResolution = (canvas, resolution) => {
  const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
  return aspect >= 1
    ? { width: Math.round(resolution * aspect), height: resolution }
    : { width: resolution, height: Math.round(resolution / aspect) };
};

export const FluidTrailCanvas = ({
  color = "#16aeea",
  radius = 4,
  intensity = 0.45,
  trailDuration = 1.65,
  onUnavailable = () => {},
}) => {
  const canvasRef = useRef(null);
  const unavailableRef = useRef(onUnavailable);

  useEffect(() => {
    unavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!gl || !gl.getExtension("EXT_color_buffer_float")) {
      unavailableRef.current();
      return undefined;
    }

    const linearFiltering = Boolean(gl.getExtension("OES_texture_float_linear"));
    const textureFilter = linearFiltering ? gl.LINEAR : gl.NEAREST;
    let programs;

    try {
      programs = {
        advection: createProgram(gl, advectionShader),
        splat: createProgram(gl, splatShader),
        divergence: createProgram(gl, divergenceShader),
        curl: createProgram(gl, curlShader),
        vorticity: createProgram(gl, vorticityShader),
        pressure: createProgram(gl, pressureShader),
        gradient: createProgram(gl, gradientShader),
        clear: createProgram(gl, clearShader),
        display: createProgram(gl, displayShader),
      };
    } catch (error) {
      console.warn("Fluid trail disabled:", error);
      unavailableRef.current();
      return undefined;
    }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    Object.values(programs).forEach(({ program }) => {
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    });

    const framebuffers = [];
    const createFramebuffer = (width, height, internalFormat, format, filter) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        width,
        height,
        0,
        format,
        gl.HALF_FLOAT,
        null,
      );

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const target = {
        texture,
        fbo,
        width,
        height,
        texel: [1 / width, 1 / height],
        attach(unit) {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return unit;
        },
      };
      framebuffers.push(target);
      return target;
    };

    const createDoubleFramebuffer = (width, height, internalFormat, format, filter) => {
      let read = createFramebuffer(width, height, internalFormat, format, filter);
      let write = createFramebuffer(width, height, internalFormat, format, filter);
      return {
        get read() { return read; },
        get write() { return write; },
        swap() { [read, write] = [write, read]; },
      };
    };

    const simSize = getResolution(canvas, SIM_RESOLUTION);
    const dyeSize = getResolution(canvas, DYE_RESOLUTION);
    const velocity = createDoubleFramebuffer(
      simSize.width,
      simSize.height,
      gl.RG16F,
      gl.RG,
      textureFilter,
    );
    const dye = createDoubleFramebuffer(
      dyeSize.width,
      dyeSize.height,
      gl.RGBA16F,
      gl.RGBA,
      textureFilter,
    );
    const pressure = createDoubleFramebuffer(
      simSize.width,
      simSize.height,
      gl.R16F,
      gl.RED,
      gl.NEAREST,
    );
    const divergence = createFramebuffer(
      simSize.width,
      simSize.height,
      gl.R16F,
      gl.RED,
      gl.NEAREST,
    );
    const curl = createFramebuffer(
      simSize.width,
      simSize.height,
      gl.R16F,
      gl.RED,
      gl.NEAREST,
    );

    const draw = (target) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.width, target.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const pointer = {
      x: 0.5,
      y: 0.5,
      previousX: 0.5,
      previousY: 0.5,
      dx: 0,
      dy: 0,
      inside: false,
      moved: false,
    };
    const pendingSplats = [];
    const trailColor = colorToRgb(color).map((channel) => channel * intensity);

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(2, Math.floor(canvas.clientWidth * pixelRatio));
      canvas.height = Math.max(2, Math.floor(canvas.clientHeight * pixelRatio));
    };

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;

      if (!inside) {
        pointer.inside = false;
        return;
      }

      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1);
      if (!pointer.inside) {
        pointer.x = x;
        pointer.y = y;
        pointer.previousX = x;
        pointer.previousY = y;
        pointer.inside = true;
        return;
      }

      pointer.dx = x - pointer.x;
      pointer.dy = y - pointer.y;
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = Math.abs(pointer.dx) + Math.abs(pointer.dy) > 0.00001;
      if (pointer.moved) {
        pendingSplats.push({
          fromX: pointer.previousX,
          fromY: pointer.previousY,
          toX: pointer.x,
          toY: pointer.y,
          dx: pointer.dx,
          dy: pointer.dy,
        });
        if (pendingSplats.length > 48) pendingSplats.shift();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    let isInView = true;
    const visibilityObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(
        ([entry]) => {
          isInView = entry.isIntersecting;
        },
        { rootMargin: "160px 0px", threshold: 0.01 },
      )
      : { observe() {}, disconnect() {} };
    visibilityObserver.observe(canvas);

    const applySplat = (x, y, dx, dy) => {
      const aspect = canvas.width / Math.max(canvas.height, 1);
      const splatRadius = radius * 0.00026 * Math.max(aspect, 1);

      gl.useProgram(programs.splat.program);
      gl.uniform1i(programs.splat.uniform("u_target"), velocity.read.attach(0));
      gl.uniform2f(programs.splat.uniform("u_point"), x, y);
      gl.uniform3f(
        programs.splat.uniform("u_color"),
        dx * 5200,
        dy * 5200,
        0,
      );
      gl.uniform1f(programs.splat.uniform("u_radius"), splatRadius);
      gl.uniform1f(programs.splat.uniform("u_aspect"), aspect);
      draw(velocity.write);
      velocity.swap();
      
      gl.useProgram(programs.splat.program);
      gl.uniform1i(programs.splat.uniform("u_target"), dye.read.attach(0));
      gl.uniform2f(programs.splat.uniform("u_point"), x, y);
      gl.uniform3f(programs.splat.uniform("u_color"), ...trailColor);
      gl.uniform1f(programs.splat.uniform("u_radius"), splatRadius);
      gl.uniform1f(programs.splat.uniform("u_aspect"), aspect);
      draw(dye.write);
      dye.swap();
    };

    const splat = () => {
      if (!pendingSplats.length) return;

      while (pendingSplats.length) {
        const segment = pendingSplats.shift();
        const distance = Math.hypot(segment.toX - segment.fromX, segment.toY - segment.fromY);
        const steps = Math.min(28, Math.max(1, Math.ceil(distance * 110)));

        for (let index = 1; index <= steps; index += 1) {
          const progress = index / steps;
          applySplat(
            segment.fromX + (segment.toX - segment.fromX) * progress,
            segment.fromY + (segment.toY - segment.fromY) * progress,
            segment.dx / steps,
            segment.dy / steps,
          );
        }
      }

      pointer.moved = false;
    };

    const step = (dt) => {
      gl.useProgram(programs.curl.program);
      gl.uniform2f(programs.curl.uniform("u_texel"), ...velocity.read.texel);
      gl.uniform1i(programs.curl.uniform("u_velocity"), velocity.read.attach(0));
      draw(curl);

      gl.useProgram(programs.vorticity.program);
      gl.uniform2f(programs.vorticity.uniform("u_texel"), ...velocity.read.texel);
      gl.uniform1i(programs.vorticity.uniform("u_velocity"), velocity.read.attach(0));
      gl.uniform1i(programs.vorticity.uniform("u_curl"), curl.attach(1));
      gl.uniform1f(programs.vorticity.uniform("u_strength"), 28);
      gl.uniform1f(programs.vorticity.uniform("u_dt"), dt);
      draw(velocity.write);
      velocity.swap();

      gl.useProgram(programs.divergence.program);
      gl.uniform2f(programs.divergence.uniform("u_texel"), ...velocity.read.texel);
      gl.uniform1i(programs.divergence.uniform("u_velocity"), velocity.read.attach(0));
      draw(divergence);

      gl.useProgram(programs.clear.program);
      gl.uniform1i(programs.clear.uniform("u_texture"), pressure.read.attach(0));
      gl.uniform1f(programs.clear.uniform("u_value"), 0.8);
      draw(pressure.write);
      pressure.swap();

      gl.useProgram(programs.pressure.program);
      gl.uniform2f(programs.pressure.uniform("u_texel"), ...velocity.read.texel);
      gl.uniform1i(programs.pressure.uniform("u_divergence"), divergence.attach(0));
      for (let index = 0; index < PRESSURE_ITERATIONS; index += 1) {
        gl.uniform1i(programs.pressure.uniform("u_pressure"), pressure.read.attach(1));
        draw(pressure.write);
        pressure.swap();
      }

      gl.useProgram(programs.gradient.program);
      gl.uniform2f(programs.gradient.uniform("u_texel"), ...velocity.read.texel);
      gl.uniform1i(programs.gradient.uniform("u_pressure"), pressure.read.attach(0));
      gl.uniform1i(programs.gradient.uniform("u_velocity"), velocity.read.attach(1));
      draw(velocity.write);
      velocity.swap();

      gl.useProgram(programs.advection.program);
      gl.uniform2f(programs.advection.uniform("u_texel"), ...velocity.read.texel);
      gl.uniform1i(programs.advection.uniform("u_velocity"), velocity.read.attach(0));
      gl.uniform1i(programs.advection.uniform("u_source"), velocity.read.attach(0));
      gl.uniform1f(programs.advection.uniform("u_dt"), dt);
      gl.uniform1f(programs.advection.uniform("u_dissipation"), 1 - 0.2 * dt);
      draw(velocity.write);
      velocity.swap();

      gl.useProgram(programs.advection.program);
      gl.uniform2f(programs.advection.uniform("u_texel"), ...dye.read.texel);
      gl.uniform1i(programs.advection.uniform("u_velocity"), velocity.read.attach(0));
      gl.uniform1i(programs.advection.uniform("u_source"), dye.read.attach(1));
      gl.uniform1f(programs.advection.uniform("u_dt"), dt);
      gl.uniform1f(
        programs.advection.uniform("u_dissipation"),
        Math.max(0, 1 - (3 / Math.max(trailDuration, 0.4)) * dt),
      );
      draw(dye.write);
      dye.swap();
    };

    const display = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(programs.display.program);
      gl.uniform1i(programs.display.uniform("u_texture"), dye.read.attach(0));
      draw(null);
    };

    let frame = 0;
    let previousTime = performance.now();
    const render = (time) => {
      const dt = Math.min(0.0166, (time - previousTime) / 1000);
      previousTime = time;
      if (isInView && !document.hidden) {
        splat();
        step(dt);
        display();
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      Object.values(programs).forEach(({ program }) => gl.deleteProgram(program));
      framebuffers.forEach(({ texture, fbo }) => {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fbo);
      });
      gl.deleteBuffer(quad);
    };
  }, [color, intensity, radius, trailDuration]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden="true"
    />
  );
};
