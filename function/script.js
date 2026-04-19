document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Navigation ---
    const hamburger = document.querySelector(".hamburger-menu");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
    });

    navLinks.forEach(link => link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
    }));

    // --- Scroll Progress Bar ---
    const progressBar = document.querySelector('.scroll-progress-bar');
    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });

    // --- On-scroll reveal animation ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id !== 'hero') {
            observer.observe(section);
        }
    });

    // --- Sticky header with shadow on scroll ---
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    // --- Typing Effect (dynamic rotation) ---
    const typingEl = document.querySelector('.typing-text');
    if (typingEl) {
        const phrases = ['intelligent systems.', 'AI-driven products.', 'scalable backends.', 'data-driven apps.'];
        let phraseIdx = 0, charIdx = 0, deleting = false;

        const type = () => {
            const current = phrases[phraseIdx];
            if (!deleting) {
                typingEl.textContent = current.substring(0, charIdx + 1);
                charIdx++;
                if (charIdx === current.length) {
                    deleting = true;
                    setTimeout(type, 1800);
                    return;
                }
            } else {
                typingEl.textContent = current.substring(0, charIdx - 1);
                charIdx--;
                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                }
            }
            setTimeout(type, deleting ? 40 : 90);
        };
        setTimeout(type, 1000);
    }

    // --- Timeline navigation + metric counters ---
    const timelineItems = document.querySelectorAll('.timeline-item');
    const spotlightCards = document.querySelectorAll('.spotlight-card');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(target)) return;
        const duration = 1200;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(eased * target);
            el.textContent = value + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        };
        requestAnimationFrame(step);
    };

    const animateActiveMetrics = () => {
        const activeCard = document.querySelector('.spotlight-card.active');
        if (!activeCard) return;
        activeCard.querySelectorAll('.metric-number').forEach(m => animateCounter(m));
    };

    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            const experienceId = item.getAttribute('data-experience');

            timelineItems.forEach(i => i.classList.remove('active'));
            spotlightCards.forEach(card => card.classList.remove('active'));

            item.classList.add('active');
            const targetCard = document.querySelector(`[data-card="${experienceId}"]`);
            if (targetCard) {
                targetCard.classList.add('active');
                setTimeout(animateActiveMetrics, 150);
            }

            if (window.innerWidth <= 768) {
                const timelineNav = document.querySelector('.timeline-nav');
                const itemRect = item.getBoundingClientRect();
                const navRect = timelineNav.getBoundingClientRect();
                const scrollLeft = timelineNav.scrollLeft;
                const targetScroll = scrollLeft + itemRect.left - navRect.left - (navRect.width / 2) + (itemRect.width / 2);

                timelineNav.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Trigger metric animation when experience section enters viewport
    const expSection = document.getElementById('experience');
    if (expSection) {
        const expObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateActiveMetrics();
                    expObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        expObserver.observe(expSection);
    }

    // --- Toggle details ---
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            btn.classList.toggle('expanded');
            content.classList.toggle('expanded');
            const label = btn.querySelector('span');
            if (label) {
                label.textContent = btn.classList.contains('expanded') ? 'Hide Competitions' : 'View All Competitions';
            }
        });
    });

    // --- Project card spotlight (mouse-tracked glow) ---
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });
    });

    // --- Image Modal ---
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const viewButtons = document.querySelectorAll('.view-certificate-btn');
    const closeModalBtn = document.querySelector('.close-modal');

    const openModal = (imgSrc) => {
        modalImage.src = imgSrc;
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    };

    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(button.getAttribute('data-img-src'));
        });
    });

    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });
});