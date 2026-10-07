import { forwardRef } from "react";

// Marco de teléfono: el mockup Android de Magic UI (magicui.design/docs/components/android),
// viewBox 380×830 con pantalla de 360×800 en (9,14). Aquí la pantalla no es una <image>
// sino HTML real debajo del SVG: el cuerpo lleva un hueco (fill-rule evenodd) para que se vea.
const BEZEL = "M0 42C0 18.8041 18.804 0 42 0H336C359.196 0 378 18.804 378 42V788C378 811.196 359.196 830 336 830H42C18.804 830 0 811.196 0 788V42Z";
const BODY = "M2 43C2 22.0132 19.0132 5 40 5H338C358.987 5 376 22.0132 376 43V787C376 807.987 358.987 825 338 825H40C19.0132 825 2 807.987 2 787V43Z";
const HOLE = "M42 14H336A33 25 0 0 1 369 39V789A33 25 0 0 1 336 814H42A33 25 0 0 1 9 789V39A33 25 0 0 1 42 14Z";
const BUTTON_A = "M376 153H378C379.105 153 380 153.895 380 155V249C380 250.105 379.105 251 378 251H376V153Z";
const BUTTON_B = "M376 301H378C379.105 301 380 301.895 380 303V351C380 352.105 379.105 353 378 353H376V301Z";

const Phone = forwardRef(function Phone({ className = "", screenClassName = "", children, ...rest }, ref) {
  return (
    <div ref={ref} className={`phone ${className}`.trim()} aria-hidden="true" {...rest}>
      <div className={`screen ${screenClassName}`.trim()}>{children}</div>
      <svg className="phone-frame" viewBox="0 0 380 830" aria-hidden="true">
        <path d={BUTTON_A} fill="#2E2E35" />
        <path d={BUTTON_B} fill="#2E2E35" />
        <path d={`${BEZEL} ${BODY}`} fill="#3A3A42" fillRule="evenodd" />
        <path d={`${BODY} ${HOLE}`} fill="#111115" fillRule="evenodd" />
        <circle cx="189" cy="28" r="9" fill="#111115" />
        <circle cx="189" cy="28" r="4" fill="#2E2E35" />
      </svg>
    </div>
  );
});

export default Phone;
