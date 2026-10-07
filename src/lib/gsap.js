// Registro único de GSAP y plugins. Todos los componentes importan de aquí.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Mismo ritmo en toda la página: una curva para entrar, otra para salir.
export const EASE_IN = "power3.out";
export const EASE_OUT = "power2.in";

export { gsap, ScrollTrigger, SplitText, useGSAP };
