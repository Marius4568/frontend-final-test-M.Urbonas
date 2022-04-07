import gsap from "gsap";

export function progressBarChange(percent) {
  gsap.to(".progress-bar", {
    width: `${percent}%`,
  });
}
