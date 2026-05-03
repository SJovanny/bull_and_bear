"use client";

import { useEffect, useRef } from "react";

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  x: number;
}

export function AnimatedChartBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const candlesRef = useRef<CandleData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate initial candles
    const generateCandles = (count: number, startX: number): CandleData[] => {
      const candles: CandleData[] = [];
      let price = 100 + Math.random() * 50;
      const candleWidth = 12;
      const gap = 4;

      for (let i = 0; i < count; i++) {
        const volatility = 2 + Math.random() * 4;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const change = direction * volatility;

        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        candles.push({
          open,
          high,
          low,
          close,
          x: startX + i * (candleWidth + gap),
        });

        price = close;
      }
      return candles;
    };

    // Generate enough candles to fill multiple screens
    const totalCandles = Math.ceil((window.innerWidth * 3) / 16);
    candlesRef.current = generateCandles(totalCandles, 0);

    const drawCandle = (
      ctx: CanvasRenderingContext2D,
      candle: CandleData,
      offsetX: number,
      baseY: number,
      scale: number,
      opacity: number
    ) => {
      const candleWidth = 10;
      const x = candle.x - offsetX;

      // Skip if off screen
      if (x < -candleWidth || x > ctx.canvas.width + candleWidth) return;

      const isBullish = candle.close > candle.open;

      // Colors with opacity - using blue theme
      const bullColor = `rgba(59, 130, 246, ${opacity * 0.6})`;
      const bearColor = `rgba(239, 68, 68, ${opacity * 0.5})`;
      const color = isBullish ? bullColor : bearColor;
      const wickColor = isBullish
        ? `rgba(59, 130, 246, ${opacity * 0.4})`
        : `rgba(239, 68, 68, ${opacity * 0.3})`;

      // Calculate positions
      const openY = baseY - (candle.open - 100) * scale;
      const closeY = baseY - (candle.close - 100) * scale;
      const highY = baseY - (candle.high - 100) * scale;
      const lowY = baseY - (candle.low - 100) * scale;

      // Draw wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    };

    const drawLine = (
      ctx: CanvasRenderingContext2D,
      candles: CandleData[],
      offsetX: number,
      baseY: number,
      scale: number,
      opacity: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.3})`;
      ctx.lineWidth = 2;

      let started = false;
      candles.forEach((candle) => {
        const x = candle.x - offsetX + 5;
        const y = baseY - (candle.close - 100) * scale;

        if (x >= -20 && x <= ctx.canvas.width + 20) {
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw multiple chart layers at different speeds and positions
      const layers = [
        { y: canvas.height * 0.25, scale: 3, speed: 0.3, opacity: 0.15 },
        { y: canvas.height * 0.5, scale: 4, speed: 0.5, opacity: 0.2 },
        { y: canvas.height * 0.75, scale: 3.5, speed: 0.7, opacity: 0.15 },
      ];

      layers.forEach((layer) => {
        const localOffset = offsetRef.current * layer.speed;
        const loopWidth = candlesRef.current.length * 16;
        const wrappedOffset = localOffset % loopWidth;

        // Draw candles
        candlesRef.current.forEach((candle) => {
          drawCandle(ctx, candle, wrappedOffset, layer.y, layer.scale, layer.opacity);
          // Draw wrapped version for seamless loop
          drawCandle(
            ctx,
            { ...candle, x: candle.x + loopWidth },
            wrappedOffset,
            layer.y,
            layer.scale,
            layer.opacity
          );
        });

        // Draw line chart overlay
        drawLine(ctx, candlesRef.current, wrappedOffset, layer.y, layer.scale, layer.opacity);
      });

      // Add gradient overlay at top and bottom
      const topGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3);
      topGradient.addColorStop(0, "rgba(8, 17, 29, 1)");
      topGradient.addColorStop(1, "rgba(8, 17, 29, 0)");
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);

      const bottomGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      bottomGradient.addColorStop(0, "rgba(8, 17, 29, 0)");
      bottomGradient.addColorStop(1, "rgba(8, 17, 29, 1)");
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      offsetRef.current += 0.5;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: "transparent" }}
      aria-hidden="true"
    />
  );
}
