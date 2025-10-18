
        document.addEventListener('DOMContentLoaded', function() {
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

            // --- Experience Section Tabs ---
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetId = button.getAttribute('data-target');
                    const targetContent = document.getElementById(targetId);

                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));

                    button.classList.add('active');
                    targetContent.classList.add('active');
                });
            });

            // --- "FOCUS VIEW" ACCORDION SCRIPT ---
            const accordionContainer = document.querySelector('.accordion-container');
            if (accordionContainer) {
                const accordionItems = accordionContainer.querySelectorAll('.accordion-item');
                accordionItems.forEach(item => {
                    const header = item.querySelector('.accordion-header');
                    const content = item.querySelector('.accordion-content');

                    header.addEventListener('click', () => {
                        const isActive = item.classList.contains('active');

                        if (isActive) {
                            item.classList.remove('active');
                            accordionContainer.classList.remove('is-focused');
                            content.style.maxHeight = null;
                        } else {
                            accordionItems.forEach(otherItem => {
                                otherItem.classList.remove('active');
                                otherItem.querySelector('.accordion-content').style.maxHeight = null;
                            });

                            item.classList.add('active');
                            accordionContainer.classList.add('is-focused');
                            content.style.maxHeight = content.scrollHeight + 'px';
                        }
                    });
                });
            }

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
