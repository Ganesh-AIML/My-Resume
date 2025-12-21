document.addEventListener('DOMContentLoaded', function() {
    // --- Mobile Navigation ---
    const hamburger = document.querySelector(".hamburger-menu");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    navLinks.forEach(link => link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    }));
    
    // --- On-scroll reveal animation ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Sticky header with shadow on scroll ---
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- EXPERIENCE SECTION: Timeline navigation ---
    const timelineItems = document.querySelectorAll('.timeline-item');
    const spotlightCards = document.querySelectorAll('.spotlight-card');

    // Animate metrics on card activation
    const animateMetrics = () => {
        const activeCard = document.querySelector('.spotlight-card.active');
        if (activeCard) {
            const metrics = activeCard.querySelectorAll('.metric-number');
            metrics.forEach((metric, index) => {
                setTimeout(() => {
                    metric.style.animation = 'none';
                    setTimeout(() => {
                        metric.style.animation = 'fadeInUp 0.6s ease forwards';
                    }, 10);
                }, index * 100);
            });
        }
    };

    // Timeline item click handler
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            const experienceId = item.getAttribute('data-experience');
            
            // Remove active states
            timelineItems.forEach(i => i.classList.remove('active'));
            spotlightCards.forEach(card => card.classList.remove('active'));
            
            // Add active state
            item.classList.add('active');
            const targetCard = document.querySelector(`[data-card="${experienceId}"]`);
            if (targetCard) {
                targetCard.classList.add('active');
                // Re-animate metrics on timeline click
                setTimeout(animateMetrics, 100);
            }
        });
    });

    // Trigger animation on initial load
    animateMetrics();

    // --- EXPERIENCE SECTION: Toggle details ---
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            btn.classList.toggle('expanded');
            content.classList.toggle('expanded');
        });
    });

    // --- IMAGE MODAL SCRIPT ---
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const viewButtons = document.querySelectorAll('.view-certificate-btn');
    const closeModalBtn = document.querySelector('.close-modal');

    function openModal(imgSrc) {
        modalImage.src = imgSrc;
        modal.classList.add('visible');
    }

    function closeModal() {
        modal.classList.remove('visible');
    }

    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const imgSrc = button.getAttribute('data-img-src');
            openModal(imgSrc);
        });
    });

    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});