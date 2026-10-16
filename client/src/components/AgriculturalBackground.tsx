import React from 'react';

const AgriculturalBackground = () => {
    return (
        <>
            {/* Agricultural Background Image */}
            <div
                className="fixed inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* Gradient Overlay for Readability */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/90 via-white/70 to-white/50 pointer-events-none" />
        </>
    );
};

export default AgriculturalBackground;
