import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";

export const SoundWaveform = () => {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let frame = 0;
    let time = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
    };

    const layers = [
      { amplitude: 0.22, frequency: 2.2, speed: 0.4, color: "rgba(167,164,157,0.35)", width: 1 },
      { amplitude: 0.34, frequency: 1.4, speed: 0.25, color: "rgba(242,240,234,0.55)", width: 1.2 },
      { amplitude: 0.14, frequency: 3.6, speed: 0.6, color: "rgba(179,38,38,0.8)", width: 1 },
    ];

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const middle = height / 2;
      const ratio = window.devicePixelRatio || 1;

      context.clearRect(0, 0, width, height);
      layers.forEach((layer, layerIndex) => {
        context.beginPath();
        context.strokeStyle = layer.color;
        context.lineWidth = layer.width * ratio;
        for (let point = 0; point <= width; point += 3) {
          const progress = point / width;
          const envelope = Math.sin(progress * Math.PI);
          const y =
            middle +
            Math.sin(progress * Math.PI * 2 * layer.frequency + time * layer.speed + layerIndex * 1.7) *
              height *
              layer.amplitude *
              envelope *
              (0.7 + 0.3 * Math.sin(time * 0.3 + layerIndex));
          point === 0 ? context.moveTo(point, y) : context.lineTo(point, y);
        }
        context.stroke();
      });

      time += 0.016;
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <section id="sound-in-motion" className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden bg-void py-24" data-testid="sound-in-motion">
      <span aria-hidden="true" className="text-outline pointer-events-none absolute -right-[4vw] top-1/2 -translate-y-1/2 font-display text-[26vw] font-black uppercase leading-none opacity-60">
        dB
      </span>
      <div className="relative z-10 px-6 md:px-10">
        <SectionHeading index="07" eyebrow="Experiment" title="Sound in motion." />
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="mt-16 h-[28vh] w-full md:h-[34vh]" />
    </section>
  );
};
