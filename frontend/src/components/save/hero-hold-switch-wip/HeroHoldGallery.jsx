import { useCallback, useEffect, useRef, useState } from "react";

const HOLD_DURATION = 2000;
const COMMIT_PROGRESS = 0.45;
const RING_LENGTH = 75.4;

const vertexShaderSource = `
  attribute vec2 aPosition;
  attribute vec2 aUv;
  varying vec2 vUv;

  void main() {
    vUv = aUv;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D uCurrent;
  uniform sampler2D uNext;
  uniform vec2 uViewport;
  uniform vec2 uImageSize;
  uniform float uProgress;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec2 coverUv(vec2 uv) {
    float viewportRatio = uViewport.x / uViewport.y;
    float imageRatio = uImageSize.x / uImageSize.y;

    if (viewportRatio > imageRatio) {
      uv.y = (uv.y - 0.5) * (imageRatio / viewportRatio) + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * (viewportRatio / imageRatio) + 0.5;
    }

    return uv;
  }

  void main() {
    vec2 grid = vec2(10.0, 8.0);
    vec2 cell = floor(vUv * grid);
    float grain = hash21(cell);
    float wave = sin((vUv.y * 8.0 + grain * 2.5) * 3.14159265) * 0.035;
    float threshold = clamp(0.06 + (1.0 - vUv.x) * 0.82 + wave + (grain - 0.5) * 0.12, 0.035, 0.965);
    float reveal = smoothstep(threshold - 0.075, threshold + 0.075, uProgress);
    float transitionBand = 1.0 - smoothstep(0.0, 0.11, abs(uProgress - threshold));

    vec2 currentUv = coverUv(vUv);
    vec2 nextUv = currentUv;
    float ripple = sin(vUv.y * 70.0 + grain * 8.0) * 0.008 * transitionBand;
    currentUv.x -= ripple;
    nextUv.x += ripple;
    currentUv.y += transitionBand * 0.006;
    nextUv.y -= transitionBand * 0.006;

    vec4 currentColor = texture2D(uCurrent, currentUv);
    vec4 nextColor = texture2D(uNext, nextUv);
    vec4 color = mix(currentColor, nextColor, reveal);
    color.rgb += transitionBand * 0.055;

    if (uProgress <= 0.001) color = currentColor;
    if (uProgress >= 0.999) color = nextColor;
    gl_FragColor = color;
  }
`;

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export const HeroHoldGallery = ({ hostRef, images }) => {
  const canvasRef = useRef(null);
  const hintRef = useRef(null);
  const progressRef = useRef(null);
  const labelRef = useRef(null);
  const animationRef = useRef(0);
  const progressValueRef = useRef(0);
  const directionRef = useRef(0);
  const lastFrameRef = useRef(0);
  const activeIndexRef = useRef(0);
  const drawingRef = useRef(null);
  const holdingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateFeedback = useCallback((progress, label = "") => {
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = String(RING_LENGTH * (1 - progress));
      progressRef.current.style.opacity = progress > 0 ? "1" : "0";
    }
    if (labelRef.current && label) labelRef.current.textContent = label;
  }, []);

  const renderProgress = useCallback((progress) => {
    drawingRef.current?.(progress, activeIndexRef.current);
    updateFeedback(progress, progress > 0 ? "SWITCHING..." : "HOLD TO SWITCH");
  }, [updateFeedback]);

  const finishSwitch = useCallback(() => {
    activeIndexRef.current = (activeIndexRef.current + 1) % images.length;
    setActiveIndex(activeIndexRef.current);
    progressValueRef.current = 0;
    directionRef.current = 0;
    holdingRef.current = false;
    drawingRef.current?.(0, activeIndexRef.current);
    updateFeedback(0, "SWITCHED!");
    if (progressRef.current) progressRef.current.style.opacity = "0";

    window.setTimeout(() => {
      if (!holdingRef.current && labelRef.current) labelRef.current.textContent = "HOLD TO SWITCH";
    }, 450);
  }, [images.length, updateFeedback]);

  const tick = useCallback((now) => {
    if (!lastFrameRef.current) lastFrameRef.current = now;
    const elapsed = Math.min(48, now - lastFrameRef.current);
    lastFrameRef.current = now;
    const nextProgress = Math.min(1, Math.max(0, progressValueRef.current + directionRef.current * elapsed / HOLD_DURATION));
    progressValueRef.current = nextProgress;
    renderProgress(nextProgress);

    if (directionRef.current > 0 && nextProgress >= 1) {
      finishSwitch();
      animationRef.current = 0;
      return;
    }

    if (directionRef.current < 0 && nextProgress <= 0) {
      directionRef.current = 0;
      holdingRef.current = false;
      lastFrameRef.current = 0;
      updateFeedback(0, "HOLD TO SWITCH");
      animationRef.current = 0;
      return;
    }

    animationRef.current = window.requestAnimationFrame(tick);
  }, [finishSwitch, renderProgress, updateFeedback]);

  const startAnimation = useCallback((direction) => {
    directionRef.current = direction;
    lastFrameRef.current = 0;
    if (!animationRef.current) animationRef.current = window.requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "high-performance" });
    if (!gl) return undefined;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1,
      -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1,
    ]), gl.STATIC_DRAW);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const uvLocation = gl.getAttribLocation(program, "aUv");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

    const textures = [];
    const loadedImages = [];
    let disposed = false;

    const createTexture = (image) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      return texture;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const currentLocation = gl.getUniformLocation(program, "uCurrent");
    const nextLocation = gl.getUniformLocation(program, "uNext");
    const viewportLocation = gl.getUniformLocation(program, "uViewport");
    const imageSizeLocation = gl.getUniformLocation(program, "uImageSize");
    const progressLocation = gl.getUniformLocation(program, "uProgress");

    drawingRef.current = (progress, index) => {
      if (textures.length !== images.length || disposed) return;
      resize();
      const nextIndex = (index + 1) % images.length;
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[index]);
      gl.uniform1i(currentLocation, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[nextIndex]);
      gl.uniform1i(nextLocation, 1);
      gl.uniform2f(viewportLocation, canvas.width, canvas.height);
      gl.uniform2f(imageSizeLocation, loadedImages[index].naturalWidth, loadedImages[index].naturalHeight);
      gl.uniform1f(progressLocation, progress);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    Promise.all(images.map((src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    }))).then((loaded) => {
      if (disposed) return;
      loadedImages.push(...loaded);
      textures.push(...loaded.map(createTexture));
      drawingRef.current?.(0, activeIndexRef.current);
      canvas.classList.add("is-ready");
    }).catch(() => {});

    const resizeObserver = new ResizeObserver(() => drawingRef.current?.(progressValueRef.current, activeIndexRef.current));
    resizeObserver.observe(canvas);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      drawingRef.current = null;
    };
  }, [images]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const positionHint = (event) => {
      if (!hintRef.current) return;
      const bounds = host.getBoundingClientRect();
      hintRef.current.style.transform = `translate3d(${event.clientX - bounds.left + 15}px, ${event.clientY - bounds.top + 15}px, 0)`;
    };

    const isInteractive = (target) => target instanceof Element && Boolean(target.closest("a, button, input, select, textarea"));

    const onPointerMove = (event) => {
      positionHint(event);
      if (!holdingRef.current && hintRef.current) {
        hintRef.current.classList.toggle("is-visible", finePointer && !isInteractive(event.target));
      }
    };

    const onPointerDown = (event) => {
      if (event.button !== 0 || isInteractive(event.target) || images.length < 2) return;
      positionHint(event);
      event.preventDefault();
      holdingRef.current = true;
      hintRef.current?.classList.add("is-visible", "is-holding");
      updateFeedback(progressValueRef.current, "SWITCHING...");
      startAnimation(1);
    };

    const onPointerUp = () => {
      if (!holdingRef.current) return;
      holdingRef.current = false;
      hintRef.current?.classList.remove("is-holding");
      startAnimation(progressValueRef.current < COMMIT_PROGRESS ? -1 : 1);
    };

    const onPointerLeave = () => {
      if (hintRef.current && !holdingRef.current) hintRef.current.classList.remove("is-visible");
      onPointerUp();
    };

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("pointerleave", onPointerLeave);

    return () => {
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      host.removeEventListener("pointerleave", onPointerLeave);
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [hostRef, images.length, startAnimation, updateFeedback]);

  return (
    <div className="hero-hold-gallery pointer-events-none absolute inset-0" aria-hidden="true">
      <img src={images[activeIndex]} alt="" className="hero-hold-fallback absolute inset-0 h-full w-full object-cover" />
      <canvas ref={canvasRef} className="hero-hold-canvas absolute inset-0 h-full w-full" />
      <div className="hero-hold-shade absolute inset-0" />

      <div ref={hintRef} className="hero-hold-hint absolute left-0 top-0 z-30">
        <svg viewBox="0 0 24.5 24.5" className="hero-hold-ring" aria-hidden="true">
          <circle className="hero-hold-ring-base" cx="12.25" cy="12.25" r="11.9" />
          <circle ref={progressRef} className="hero-hold-ring-progress" cx="12.25" cy="12.25" r="11.9" />
        </svg>
        <span ref={labelRef} className="hero-hold-label">HOLD TO SWITCH</span>
      </div>
    </div>
  );
};
