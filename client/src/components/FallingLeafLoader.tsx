import React, { useEffect, useState } from 'react';

interface FallingLeafLoaderProps {
    onComplete?: () => void;
}

const images = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop"
];

const FallingLeafLoader: React.FC<FallingLeafLoaderProps> = ({ onComplete }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Image Slideshow logic
        const imageInterval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000); // Change image every 3 seconds

        // Main Sequence Timeline
        // 0s: Animation starts
        // 2s: Leaf lands
        // 2.5s: Text and progress bar appear
        // 5.5s: Fade out starts
        // 6s: Complete
        const totalTime = 6000;

        const timer = setTimeout(() => {
            setIsFadingOut(true);
            if (onComplete) {
                setTimeout(onComplete, 800);
            }
        }, totalTime);

        return () => {
            clearTimeout(timer);
            clearInterval(imageInterval);
        };
    }, [onComplete]);

    return (
        <>
            <style>{`
        @keyframes fallAndSway {
            0% { transform: translateY(-20vh) translateX(-10vw) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            25% { transform: translateY(20vh) translateX(10vw) rotate(45deg); }
            50% { transform: translateY(50vh) translateX(-5vw) rotate(90deg); }
            75% { transform: translateY(80vh) translateX(5vw) rotate(135deg); }
            100% { transform: translateY(100vh) translateX(0) rotate(180deg); opacity: 0; }
        }

        @keyframes land {
            0% { transform: translateY(-120vh) rotate(-45deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }

        @keyframes textReveal {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); letter-spacing: -0.05em; }
            100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 0.02em; }
        }

        @keyframes progressFill {
            0% { width: 0%; }
            100% { width: 100%; }
        }

        @keyframes kenBurns {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }

        .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.8s ease-in-out;
            overflow: hidden;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .bg-image-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        }

        .bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
            transform-origin: center;
        }

        .bg-image.active {
            opacity: 1;
            animation: kenBurns 6s linear forwards; /* Smooth zoom effect */
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 1;
        }

        .loader-container.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        .content-wrapper {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .leaf-wrapper {
            width: 120px;
            height: 120px;
            animation: land 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0px 20px 30px rgba(0,0,0,0.15));
        }
        
        .leaf-svg {
             width: 100%;
             height: 100%;
        }

        .brand-text {
            margin-top: 30px;
            font-size: 3.5rem;
            font-weight: 800;
            color: #111;
            opacity: 0;
            animation: textReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            animation-delay: 2.2s;
            text-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .brand-text span {
            color: #2e7d32;
        }

        .progress-container {
            margin-top: 30px; /* Spacing from text */
            width: 200px;
            height: 4px;
            background: rgba(0,0,0,0.1);
            border-radius: 2px;
            overflow: hidden;
            opacity: 0;
            animation: textReveal 1s ease-out forwards;
            animation-delay: 2.5s;
        }

        .progress-bar {
            height: 100%;
            background: #2e7d32;
            width: 0%;
            animation: progressFill 3.5s linear forwards;
            animation-delay: 2.5s;
        }
      `}</style>

            <div className={`loader-container ${isFadingOut ? 'fade-out' : ''}`}>
                <div className="bg-image-wrapper">
                    {images.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            className={`bg-image ${index === currentImageIndex ? 'active' : ''}`}
                            alt="Background"
                        />
                    ))}
                </div>
                <div className="overlay"></div>

                <div className="content-wrapper">
                    <div className="leaf-wrapper">
                        <svg className="leaf-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2C12 2 13.5 8 16.5 10C19.5 12 22 13 22 13C22 13 18 15 15 17C12 19 8 20 6 20C4 20 2 18 2 14C2 10 5 6 8 4C11 2 12 2 12 2Z"
                                fill="#4CAF50"
                                stroke="#1B5E20"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 2C12 2 9 10 6 20"
                                stroke="#1B5E20"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h1 className="brand-text">Agro<span>AI</span></h1>

                    <div className="progress-container">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FallingLeafLoader;
