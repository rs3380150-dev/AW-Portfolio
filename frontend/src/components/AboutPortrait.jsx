import { useEffect, useRef, useState } from "react";
import { Disc3 } from "@/components/icons";
import { FluidTrailCanvas } from "@/components/FluidTrailCanvas";

const PortraitDecorations = () => (
  <>
    <div className="about-hero-badge absolute -top-4 left-5 z-20 rounded-md border border-white/10 bg-void/75 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:-left-4">
      <Disc3 className="h-5 w-5 text-cyan" aria-hidden="true" />
      <p className="mt-2 font-display text-2xl font-bold leading-none">Open</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
        Collabs & Live
      </p>
    </div>
    <div className="about-record-card absolute -bottom-8 -right-3 hidden h-32 w-32 overflow-hidden rounded-md border border-cyan/20 bg-void/80 backdrop-blur-xl md:block">
      <div className="absolute inset-5 rounded-full border border-white/15 bg-[radial-gradient(circle,rgba(179,38,38,0.18)_0%,rgba(179,38,38,0.14)_23%,rgba(179,38,38,0.14)_38%,rgba(255,255,255,0.04)_39%,rgba(255,255,255,0.02)_100%)]" />
      <div className="absolute inset-[3.25rem] rounded-full bg-cyan" />
    </div>
  </>
);

const PortraitBackdrop = ({ src }) => (
  <>
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-[108%] w-full scale-110 object-cover opacity-35 blur-md"
    />
    <div className="about-image-overlay absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent" />
  </>
);

export const ClassicAboutPortrait = ({ src, alt }) => (
  <div className="relative h-full min-h-[520px]" data-testid="about-portrait-classic">
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-md border border-white/10 bg-white/[0.03] md:min-h-[640px]">
      <PortraitBackdrop src={src} />
      <img
        src={src}
        alt={alt}
        className="about-portrait-image absolute inset-0 z-10 h-full w-full object-contain object-center"
      />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-void/25 via-transparent to-transparent" />
    </div>
    <PortraitDecorations />
  </div>
);

const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 v_uv;
  uniform sampler2D u_image;
  uniform vec2 u_canvas_size;
  uniform vec2 u_image_size;
  uniform vec2 u_pointer;
  uniform vec2 u_velocity;
  uniform float u_time;
  uniform float u_strength;

  vec2 containUv(vec2 uv) {
    float canvasAspect = u_canvas_size.x / max(u_canvas_size.y, 1.0);
    float imageAspect = u_image_size.x / max(u_image_size.y, 1.0);
    vec2 size = vec2(1.0);

    if (canvasAspect > imageAspect) {
      size.x = imageAspect / canvasAspect;
    } else {
      size.y = canvasAspect / imageAspect;
    }

    return (uv - (1.0 - size) * 0.5) / size;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 delta = uv - u_pointer;
    delta.x *= u_canvas_size.x / max(u_canvas_size.y, 1.0);
    float distanceToPointer = length(delta);
    float influence = smoothstep(0.34, 0.0, distanceToPointer) * u_strength;
    vec2 direction = normalize(delta + vec2(0.0001));
    vec2 tangent = vec2(-direction.y, direction.x);
    float ripple = sin(distanceToPointer * 52.0 - u_time * 5.5);

    uv -= u_velocity * influence * 0.32;
    uv += direction * ripple * influence * 0.012;
    uv += tangent * sin(distanceToPointer * 27.0 + u_time * 2.2) * influence * 0.006;

    vec2 imageUv = containUv(uv);
    float inside = step(0.0, imageUv.x) * step(imageUv.x, 1.0) *
                   step(0.0, imageUv.y) * step(imageUv.y, 1.0);
    vec4 color = texture2D(u_image, vec2(imageUv.x, 1.0 - imageUv.y));
    float glow = influence * 0.12;
    color.rgb += vec3(0.02, 0.32, 0.5) * glow;

    gl_FragColor = vec4(color.rgb, color.a * inside);
  }
`;

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unable to compile portrait shader";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
};

const createProgram = (gl) => {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unable to link portrait shader";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
};

const LiquidCanvas = ({ src, onReady, onUnavailable }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      onUnavailable();
      return undefined;
    }

    let program;
    try {
      program = createProgram(gl);
    } catch (error) {
      console.warn("Liquid portrait disabled:", error);
      onUnavailable();
      return undefined;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = "anonymous";
    let imageReady = false;
    let disposed = false;
    const pointer = { x: 0.62, y: 0.48, targetX: 0.62, targetY: 0.48 };
    const velocity = { x: 0, y: 0 };
    let strength = 0;
    let targetStrength = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(2, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(2, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const updatePointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.targetX = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      pointer.targetY = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1);
      targetStrength = 1;
    };

    const releasePointer = () => {
      targetStrength = 0;
    };

    canvas.addEventListener("pointerenter", updatePointer, { passive: true });
    canvas.addEventListener("pointermove", updatePointer, { passive: true });
    canvas.addEventListener("pointerleave", releasePointer, { passive: true });

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    image.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      imageReady = true;
      onReady();
    };
    image.onerror = onUnavailable;
    image.src = src;

    const locations = {
      image: gl.getUniformLocation(program, "u_image"),
      canvasSize: gl.getUniformLocation(program, "u_canvas_size"),
      imageSize: gl.getUniformLocation(program, "u_image_size"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      velocity: gl.getUniformLocation(program, "u_velocity"),
      time: gl.getUniformLocation(program, "u_time"),
      strength: gl.getUniformLocation(program, "u_strength"),
    };

    const render = (time) => {
      resize();
      velocity.x = (pointer.targetX - pointer.x) * 0.34 + velocity.x * 0.72;
      velocity.y = (pointer.targetY - pointer.y) * 0.34 + velocity.y * 0.72;
      pointer.x += (pointer.targetX - pointer.x) * 0.16;
      pointer.y += (pointer.targetY - pointer.y) * 0.16;
      strength += (targetStrength - strength) * 0.08;

      if (imageReady) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(locations.image, 0);
        gl.uniform2f(locations.canvasSize, canvas.width, canvas.height);
        gl.uniform2f(locations.imageSize, image.naturalWidth, image.naturalHeight);
        gl.uniform2f(locations.pointer, pointer.x, pointer.y);
        gl.uniform2f(locations.velocity, velocity.x, velocity.y);
        gl.uniform1f(locations.time, time * 0.001);
        gl.uniform1f(locations.strength, strength);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      canvas.removeEventListener("pointerenter", updatePointer);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", releasePointer);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [onReady, onUnavailable, src]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 h-full w-full touch-pan-y"
      aria-hidden="true"
    />
  );
};

export const LiquidAboutPortrait = ({ src, alt }) => {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const readyCallback = useRef(() => setReady(true)).current;
  const unavailableCallback = useRef(() => setUnavailable(true)).current;

  if (unavailable) return <ClassicAboutPortrait src={src} alt={alt} />;

  return (
    <div className="relative h-full min-h-[520px]" data-testid="about-portrait-liquid">
      <div className="liquid-about-frame relative h-full min-h-[520px] overflow-hidden rounded-md border border-cyan/20 bg-white/[0.03] md:min-h-[640px]">
        <PortraitBackdrop src={src} />
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 z-10 h-full w-full object-contain object-center transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        <LiquidCanvas
          src={src}
          onReady={readyCallback}
          onUnavailable={unavailableCallback}
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-void/25 via-transparent to-transparent" />
        <p className="liquid-about-hint pointer-events-none absolute bottom-4 right-4 z-30 hidden rounded-full border border-white/10 bg-void/55 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45 backdrop-blur-md lg:block">
          Move cursor to distort
        </p>
      </div>
      <PortraitDecorations />
    </div>
  );
};

export const FluidTrailAboutPortrait = ({ src, alt }) => {
  const [unavailable, setUnavailable] = useState(false);
  const unavailableCallback = useRef(() => setUnavailable(true)).current;

  if (unavailable) return <ClassicAboutPortrait src={src} alt={alt} />;

  return (
    <div className="relative h-full min-h-[520px]" data-testid="about-portrait-fluid">
      <div className="liquid-about-frame relative h-full min-h-[520px] overflow-hidden rounded-md border border-cyan/20 bg-white/[0.03] md:min-h-[640px]">
        <PortraitBackdrop src={src} />
        <img
          src={src}
          alt={alt}
          className="about-portrait-image absolute inset-0 z-10 h-full w-full object-contain object-center"
        />
        <FluidTrailCanvas
          color="#b32626"
          radius={1.2}
          intensity={0.25}
          trailDuration={1.65}
          onUnavailable={unavailableCallback}
        />
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-void/25 via-transparent to-transparent" />
        <p className="liquid-about-hint pointer-events-none absolute bottom-4 right-4 z-40 hidden rounded-full border border-white/10 bg-void/55 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45 backdrop-blur-md lg:block">
          Move cursor for fluid trail
        </p>
      </div>
      <PortraitDecorations />
    </div>
  );
};

export const AboutPortrait = ({ mode = "classic", src, alt }) => {
  const [supportsEffect, setSupportsEffect] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setSupportsEffect(Boolean(finePointer && !reducedMotion));
  }, []);

  if (!supportsEffect || mode === "classic") {
    return <ClassicAboutPortrait src={src} alt={alt} />;
  }

  if (mode === "fluid") {
    return <FluidTrailAboutPortrait src={src} alt={alt} />;
  }

  if (mode === "distortion" || mode === "liquid") {
    return <LiquidAboutPortrait src={src} alt={alt} />;
  }

  return <ClassicAboutPortrait src={src} alt={alt} />;
};
