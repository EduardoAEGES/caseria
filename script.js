document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // MOBILE NAV TOGGLE
    // ==========================================================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
        
        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // ==========================================================================
    // CHOCOCLUB CONFIGURATOR
    // ==========================================================================
    const classicsInput = document.getElementById('input-classics');
    const toffeesInput = document.getElementById('input-toffees');
    const premiumInput = document.getElementById('input-premium');
    const monthsInput = document.getElementById('input-months');

    const classicsVal = document.getElementById('val-classics');
    const toffeesVal = document.getElementById('val-toffees');
    const premiumVal = document.getElementById('val-premium');
    const monthsVal = document.getElementById('val-months');

    const itemsResult = document.getElementById('result-items');
    const pointsResult = document.getElementById('result-points');
    const monthlyCostResult = document.getElementById('result-monthly-cost');
    const redeemResult = document.getElementById('result-redeem');

    function formatSoles(val) {
        return `S/. ${val.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`;
    }

    function calculateBox() {
        if (!classicsInput || !toffeesInput || !premiumInput || !monthsInput) return;

        const classics = parseInt(classicsInput.value);
        const toffees = parseInt(toffeesInput.value);
        const premium = parseInt(premiumInput.value);
        const months = parseInt(monthsInput.value);

        // Update range labels
        classicsVal.textContent = `${classics} ${classics === 1 ? 'Tableta' : 'Tabletas'}`;
        toffeesVal.textContent = `${toffees} ${toffees === 1 ? 'Caja' : 'Cajas'}`;
        premiumVal.textContent = `${premium} ${premium === 1 ? 'Tableta' : 'Tabletas'}`;
        monthsVal.textContent = `${months} ${months === 1 ? 'Mes' : 'Meses'}`;

        // Calculations
        const totalItems = classics + toffees + premium;
        
        // Points system:
        // Classics = 10 pts, Toffees = 25 pts, Premium = 20 pts
        // Total points accumulated over subscription months
        const totalPoints = ((classics * 10) + (toffees * 25) + (premium * 20)) * months;

        // Pricing logic
        const classicsPrice = classics * 9.50;
        const toffeesPrice = toffees * 18.00;
        const premiumPrice = premium * 15.00;
        const basePrice = classicsPrice + toffeesPrice + premiumPrice;
        
        // Shipping free & 15% discount for Club members
        const monthlyCost = Math.round(basePrice * 0.85);

        // Render results
        itemsResult.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
        if (pointsResult) pointsResult.textContent = `${totalPoints} pts`;
        monthlyCostResult.textContent = formatSoles(monthlyCost);
        
        // Collectible suggestion based on points
        let redeemText = "Ninguna";
        if (totalPoints >= 800) {
            redeemText = "Colección Completa 🏆";
        } else if (totalPoints >= 500) {
            redeemText = "1 Premium + 1 Básica 🌟";
        } else if (totalPoints >= 400) {
            redeemText = "Choco/Cocoita Premium 👑";
        } else if (totalPoints >= 200) {
            redeemText = "Choco + Cocoita Básica 🍫";
        } else if (totalPoints >= 100) {
            redeemText = "Choco/Cocoita Básica 🍬";
        }
        if (redeemResult) redeemResult.textContent = redeemText;
    }

    // Attach input listeners
    const inputs = [classicsInput, toffeesInput, premiumInput, monthsInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculateBox);
        }
    });

    // Run initial calculation
    calculateBox();

    // ==========================================================================
    // CONTACT FORM INTERACTIVITY
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('btn-submit-form');
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando solicitud...';

            // Simulate server network latency of 1.5s
            setTimeout(() => {
                contactForm.style.opacity = '0';
                
                setTimeout(() => {
                    contactForm.classList.add('hidden');
                    formFeedback.classList.remove('hidden');
                    formFeedback.style.opacity = '1';
                }, 300);

            }, 1500);
        });
    }

    // ==========================================================================
    // SCROLL ACTIONS & INTERSECTION OBSERVER FOR TRANSITIONS
    // ==========================================================================
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    // Active navigation highlighting on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 120; // offset header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Reveal elements on scroll
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Add visual reveal classes to style sheets dynamically
    const elementsToReveal = document.querySelectorAll('.service-card, .stat-item, .calculator-container, .contact-container, .section-header, .collectible-card, .gallery-item');
    
    // Inject styling for scroll reveal dynamically (keeping CSS clean)
    const style = document.createElement('style');
    style.innerHTML = `
        .service-card, .stat-item, .calculator-container, .contact-container, .section-header, .collectible-card, .gallery-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    elementsToReveal.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================================================
    // FILTER COLLECTIBLES
    // ==========================================================================
    window.filterCharacter = (character) => {
        const cards = document.querySelectorAll('.collectible-card');
        const buttons = document.querySelectorAll('.tab-btn');
        
        // Update active tab button style based on its onclick attribute
        buttons.forEach(btn => {
            const clickAttr = btn.getAttribute('onclick') || '';
            if (clickAttr.includes(`'${character}'`)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show/hide cards with smooth transition
        cards.forEach(card => {
            const cardChar = card.getAttribute('data-character');
            if (character === 'all' || cardChar === character) {
                card.style.display = 'flex'; // Use flex layout to maintain card design
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    };
});
