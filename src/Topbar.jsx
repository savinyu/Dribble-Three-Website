import { useContext, useRef } from "react";
import { ClickedContext } from "./App";
import gsap from "gsap";

const Topbar = () => {
  const { setClicked } = useContext(ClickedContext);
  const overlayRef = useRef();

  const resetPage = () => {
    setClicked(false);
    gsap.to(overlayRef.current, {
      scale: 200, // A large enough scale to cover the entire screen
      duration: 6, // Adjust duration for a smooth animation
      ease: "power2.inOut",
      onComplete: () => {
        // Hold the black screen for 1 second before resetting
        setTimeout(() => {
          // Perform any reset or additional actions here
          // For example, you could reset the scale, or navigate to another page
          gsap.to(overlayRef.current, {
            scale: 0, // Reset the scale
            duration: 0, // Instantly reset to initial state
          });
        }, 100); // 1-second delay
      },
    });
  };

  return (
    <>
      <div ref={overlayRef} className="circular-overlay"></div>
      <div className="topbar">
        <div className="logo" onClick={resetPage}>W</div>
        <div className="rightend">
          <div className="btn">About</div>
          <div className="btn">Work</div>
          <div className="btn">Contact</div>
        </div>
      </div>
    </>
  );
};

export default Topbar;
