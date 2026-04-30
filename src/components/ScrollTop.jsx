// src/components/ScrollTop.jsx
import { useState, useEffect } from 'react';

export default function ScrollTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            className={`scroll-top${visible ? ' visible' : ''}`}
            id="scrollTop"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Kembali ke atas"
        >
            <i className="fas fa-arrow-up" />
        </button>
    );
}