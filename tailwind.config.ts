import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
        },
        "brand-orange": "hsl(var(--brand-orange))",
        "brand-orange-light": "hsl(var(--brand-orange-light))",
        onbrand: {
          DEFAULT: "hsl(var(--on-brand))",
          soft: "hsl(var(--on-brand-soft))",
          ok: "hsl(var(--on-brand-ok))",
          warn: "hsl(var(--on-brand-warn))",
          crit: "hsl(var(--on-brand-crit))",
        },
        slate: { soft: "hsl(var(--slate-soft))" },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          raised: "hsl(var(--surface-raised))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
          soft: "hsl(var(--danger-soft))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
        },
        // NETIA Brand Colors
        netia: {
          blue: "hsl(var(--netia-blue))",
          orange: "hsl(var(--netia-orange))",
          'bg-light': "hsl(var(--netia-bg-light))",
          'bg-lighter': "hsl(var(--netia-bg-lighter))",
          'text-primary': "hsl(var(--netia-text-primary))",
          'text-secondary': "hsl(var(--netia-text-secondary))",
          'text-disabled': "hsl(var(--netia-text-disabled))",
        },
        // Avatar Colors (also available as top-level for easier use)
        avatar: {
          tino: "hsl(var(--avatar-tino))",
          zahia: "hsl(var(--avatar-zahia))",
          roma: "hsl(var(--avatar-roma))",
        },
        chat: {
          bg: "hsl(var(--chat-bg))",
          out: "hsl(var(--chat-out))",
          system: "hsl(var(--chat-system))",
        },
        tino: { DEFAULT: "hsl(var(--avatar-tino))", soft: "hsl(var(--avatar-tino-soft))" },
        zahia: { DEFAULT: "hsl(var(--avatar-zahia))", soft: "hsl(var(--avatar-zahia-soft))" },
        roma: { DEFAULT: "hsl(var(--avatar-roma))", soft: "hsl(var(--avatar-roma-soft))" },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        xl: "var(--radius-lg)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        bubble: "var(--shadow-bubble)",
      },
      backgroundImage: {
        ai: "var(--ai-gradient)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        in: "var(--ease-in)",
        spring: "var(--ease-spring)",
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "bubble-in-left": { from: { opacity: "0", transform: "translateX(-8px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "bubble-in-right": { from: { opacity: "0", transform: "translateX(8px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "slide-in-right": { from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "ai-breathe": { "0%, 100%": { opacity: "0.5" }, "50%": { opacity: "1" } },
        "typing": {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-3px)" },
        },
        "check-draw": { from: { strokeDashoffset: "24" }, to: { strokeDashoffset: "0" } },
        "float-up": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-24px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0)" },
          "25%": { transform: "rotate(-8deg)" },
          "75%": { transform: "rotate(8deg)" },
        },
        "dot-hop": {
          "0%, 70%, 100%": { transform: "translateY(0)" },
          "35%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up var(--dur-base) var(--ease-out) both",
        "pop-in": "pop-in var(--dur-base) var(--ease-spring) both",
        "bubble-in-left": "bubble-in-left var(--dur-base) var(--ease-out) both",
        "bubble-in-right": "bubble-in-right var(--dur-base) var(--ease-out) both",
        "slide-in-right": "slide-in-right var(--dur-base) var(--ease-out) both",
        "shimmer": "shimmer 1.4s linear infinite",
        "ai-breathe": "ai-breathe 1.6s ease-in-out infinite",
        "typing": "typing 1s ease-in-out infinite",
        "check-draw": "check-draw 300ms var(--ease-out) both",
        "float-up": "float-up 700ms var(--ease-out) both",
        "wiggle": "wiggle 400ms ease-in-out 1",
        "dot-hop": "dot-hop 900ms ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
