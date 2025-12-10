const isMobileDevice = () => window.innerWidth <= 768;
const isMobileTablet = () => window.innerWidth <= 968 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelector(sel);
const $all = (sel) => document.querySelectorAll(sel);

function initGSAP() {
    const check = () => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger, SplitText);
            const m = isMobileDevice();
            ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", ignoreMobileResize: true, fastScrollEnd: true, syncInterval: m ? 100 : 16, limitCallbacks: m });
            gsap.config({ nullTargetWarn: false, trialWarn: false });
            return true;
        }
        return false;
    };
    if (!check()) {
        let a = 0;
        const i = setInterval(() => { if (check() || ++a >= 100) clearInterval(i); }, 50);
    }
}
initGSAP();

function initPageTransitions() {
    if (!document.startViewTransition) return;
    
    $all('a[href$=".html"]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (['footerBewerbungsformular', 'projectsLink'].includes(link.id) || 
            (link.classList.contains('mobile-menu-item') && link.textContent.trim() === 'Bewerbungsformular')) return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Mobile Menu Overlay nicht schließen - Transition übernimmt
            if (link.classList.contains('mobile-menu-item')) {
                const overlay = document.getElementById('mobileMenuOverlay');
                if (overlay) overlay.style.pointerEvents = 'none';
            }
            document.startViewTransition(() => { window.location.href = href; });
        });
    });
}

const onDOMReady = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

const cachedElements = { heroSection: null, studioSection: null, mainSection: null, expandingSection: null, footerSection: null, loadingLineFill: null, loadingNumber: null, pilcrow: null, heroTitle: null, heroDescription: null, centerLinks: null, navigationContainer: null, locationLink: null, contactLink: null, mobileBurger: null };
onDOMReady(() => {
    cachedElements.heroSection = $('heroSection');
    cachedElements.studioSection = $('studioSection');
    cachedElements.mainSection = $('mainSection');
    cachedElements.expandingSection = $('expandingSection');
    cachedElements.footerSection = $('footerSection');
    cachedElements.loadingLineFill = $('loadingLineFill');
    cachedElements.loadingNumber = $('loadingNumber');
    cachedElements.pilcrow = $('pilcrowSymbol');
    cachedElements.heroTitle = $$('.hero-title');
    cachedElements.heroDescription = $$('.hero-description');
    cachedElements.centerLinks = $('centerLinks');
    cachedElements.navigationContainer = $$('.navigation-container');
    cachedElements.locationLink = $('locationLink');
    cachedElements.contactLink = $('contactLink');
    cachedElements.mobileBurger = $('mobileBurger');
});

onDOMReady(() => {
    initPageTransitions();
    
    // Loading Line auf index.html nicht einfaden
    const isIndexPage = !document.body.classList.contains('scrollable');
    if (isIndexPage) {
        document.querySelectorAll('.loading-line, .loading-number').forEach(el => el.style.opacity = '1');
    }
});

const PAGE_ANIMATION_CONFIG = { noPreloader: ['datenschutz.html', 'team.html', 'impressum.html', 'service1.html', 'kontaktformular.html'], noMenuAnimation: ['datenschutz.html', 'team.html', 'impressum.html', 'service1.html', 'kontaktformular.html'], scrollableHeader: ['datenschutz.html', 'team.html', 'impressum.html', 'service1.html', 'kontaktformular.html'] };
const shouldDisableAnimation = (type) => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Für noMenuAnimation: Deaktiviere auf allen Unterseiten (scrollable) außer index.html
    if (type === 'noMenuAnimation') {
        return document.body.classList.contains('scrollable') || PAGE_ANIMATION_CONFIG[type]?.includes(currentPage) || false;
    }
    return PAGE_ANIMATION_CONFIG[type]?.includes(currentPage) || false;
};
function makeMenuVisibleImmediately() {
    if (!shouldDisableAnimation('noMenuAnimation') || typeof gsap === 'undefined') return;
    [{ el: $$('.navigation-container'), props: { opacity: 1 } }, { el: $('centerLinks'), props: { opacity: 1 } }, { el: $('mobileBurger'), props: { opacity: 1, xPercent: -50 } }, { el: $('locationLink'), props: { opacity: 1 } }, { el: $('contactLink'), props: { opacity: 1 } }].forEach(({ el, props }) => {
        if (el) { el.style.opacity = '1'; gsap.set(el, { ...props, immediateRender: true }); }
    });
}
const makeHeaderScrollable = () => { if (shouldDisableAnimation('scrollableHeader')) document.body.classList.add('header-scrollable'); };

function animateHeader() {
    // Nur auf index.html animieren, nicht auf anderen Unterseiten
    if (document.body.classList.contains('scrollable')) {
        // Auf Unterseiten: Header sofort sichtbar machen ohne Animation
        const words = $all('.header .word');
        words.forEach(word => {
            gsap.set(word, { opacity: 1, y: 0 });
        });
        return;
    }
    
    // Auf index.html: Animation ausführen
    const words = $all('.header .word');
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(words[0], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
    tl.fromTo(words[1], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.2");
}
window.addEventListener('load', () => { animateHeader(); setTimeout(() => animatePilcrow(), 2000); });

function animatePilcrow() {
    const hint = $$('.scroll-hint');
    if (hint) {
        gsap.timeline({ delay: 0.5 }).fromTo(hint, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 1.5);
        hint.addEventListener('click', () => cachedElements.studioSection?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
}

// Card Toggle Panel Functionality
function initCardPanel() {
    const contactLink = document.getElementById('contactLink');
    const cardSlidePanel = document.getElementById('cardSlidePanel');
    const closeCardPanel = document.getElementById('closeCardPanel');
    const cardSwitch = document.getElementById('cardSwitch');
    const cardSwitch2 = document.getElementById('cardSwitch2');
    const businessCard1 = document.getElementById('businessCard1');
    const businessCard2 = document.getElementById('businessCard2');

    if (!contactLink || !cardSlidePanel) return;

    let card1Flipped = false;
    let card2Flipped = false;

    // Open panel on contact link click
    contactLink.addEventListener('click', () => {
        cardSlidePanel.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Show both cards after expansion animation (0.8s + 0.6s delay = 1.4s total)
        setTimeout(() => {
            businessCard1.classList.add('active');
            businessCard2.classList.add('active');
            businessCard1.classList.remove('flipped');
            businessCard2.classList.remove('flipped');
            card1Flipped = false;
            card2Flipped = false;
            cardSwitch.classList.remove('active');
            if (cardSwitch2) cardSwitch2.classList.remove('active');
        }, 800);
    });

    // Close panel
    if (closeCardPanel) {
        closeCardPanel.addEventListener('click', () => {
            // Hide current cards first
            businessCard1.classList.remove('active', 'flipped');
            businessCard2.classList.remove('active', 'flipped');
            card1Flipped = false;
            card2Flipped = false;
            
            // Hide cards first
            businessCard1.classList.remove('active');
            businessCard2.classList.remove('active');
            
            // Add closing class to collapse panel back to button position
            cardSlidePanel.classList.add('closing');
            
            // Remove active and closing classes after animation completes
            setTimeout(() => {
                cardSlidePanel.classList.remove('active', 'closing');
                cardSwitch.classList.remove('active');
                if (cardSwitch2) cardSwitch2.classList.remove('active');
                document.body.style.overflow = '';
            }, 800);
        });
    }

    // Switch 1 to flip card 1
    if (cardSwitch) {
        cardSwitch.addEventListener('click', () => {
            const isActive = cardSwitch.classList.contains('active');
            
            if (isActive) {
                // Flip back to front
                cardSwitch.classList.remove('active');
                businessCard1.classList.remove('flipped');
                card1Flipped = false;
            } else {
                // Flip to back
                cardSwitch.classList.add('active');
                businessCard1.classList.add('flipped');
                card1Flipped = true;
            }
        });
    }

    // Switch 2 to flip card 2
    if (cardSwitch2) {
        cardSwitch2.addEventListener('click', () => {
            const isActive = cardSwitch2.classList.contains('active');
            
            if (isActive) {
                // Flip back to front
                cardSwitch2.classList.remove('active');
                businessCard2.classList.remove('flipped');
                card2Flipped = false;
            } else {
                // Flip to back
                cardSwitch2.classList.add('active');
                businessCard2.classList.add('flipped');
                card2Flipped = true;
            }
        });
    }
}

onDOMReady(initCardPanel);

// Questionnaire Overlay Functionality
function initQuestionnaire() {
    const questionnaireOverlay = document.getElementById('questionnaireOverlay');
    const questionnaireClose = document.getElementById('questionnaireClose');
    const questions = document.querySelectorAll('.questionnaire-question');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressPercentage2 = document.getElementById('progressPercentage2');
    const questionnaireContainer = document.querySelector('.questionnaire-container');
    const progressPoints = document.querySelectorAll('.progress-point');
    
    // Allow questionnaire to work even without overlay (for test.html)
    if (!questionnaireContainer || questions.length === 0) {
        return;
    }
    
    let currentQuestion = 0;
    const totalQuestions = 5;
    const answers = {};
    let currentPercentage = 0; // Track current percentage for animation
    let userName = '';
    let kanzleiName = '';
    
    // Get input elements
    const userNameInput = document.getElementById('userName');
    const kanzleiNameInput = document.getElementById('kanzleiName');
    const welcomeContinueBtn = document.getElementById('welcomeContinueBtn');
    const userNameDisplays = [
        document.getElementById('userNameDisplay'),
        document.getElementById('userNameDisplay2'),
        document.getElementById('userNameDisplay3')
    ];
    const applicationUserName = document.getElementById('applicationUserName');
    
    // ============================================
    // Progress Line - Initialisierung
    // ============================================
    const progressLineFill = questionnaireContainer?.querySelector('.progress-line-fill');
    const progressLineBg = questionnaireContainer?.querySelector('.progress-line-bg');
    
    /**
     * Initialisiert den Progress Line
     * @param {HTMLElement} overlayElement - Das Overlay-Element, das den Progress Line enthält
     * @param {number} totalSteps - Gesamtanzahl der Schritte
     * @returns {Object} - Objekt mit updateProgressLine Funktion
     */
    function initProgressLine(overlayElement, totalSteps) {
        const borderFill = overlayElement.querySelector('.progress-line-fill');
        const borderBg = overlayElement.querySelector('.progress-line-bg');
        
        if (!borderFill || !borderBg) {
            return null;
        }
        
        /**
         * Aktualisiert den Progress Line
         * @param {number} step - Aktueller Schritt (0 = kein Fortschritt, 1+ = Fortschritt)
         */
        function updateProgressLine(step) {
            // Warte auf nächsten Frame, um sicherzustellen, dass Dimensionen korrekt sind
            requestAnimationFrame(() => {
                // Hole tatsächliche Dimensionen vom Overlay-Element
                const overlayRect = overlayElement.getBoundingClientRect();
                const w = overlayRect.width;
                const h = overlayRect.height;
                
                // Radius basierend auf Bildschirmgröße: Mobile = 30px, Desktop = 40px
                const isMobile = isMobileDevice();
                const r = isMobile ? 30 : 40; // border-radius (Mobile: 30px, Desktop: 40px)
                
                // Aktualisiere rect-Dimensionen dynamisch (SVG unterstützt kein calc())
                if (borderBg) {
                    borderBg.setAttribute('width', w - 4);
                    borderBg.setAttribute('height', h - 4);
                    borderBg.setAttribute('rx', r);
                    borderBg.setAttribute('ry', r);
                }
                
                // Das rect im SVG startet bei x=2, y=2 und hat width/height calc(100% - 4px)
                // Also sind die tatsächlichen rect-Dimensionen: width - 4px, height - 4px
                const rectWidth = w - 4;  // width - 4px (2px auf jeder Seite)
                const rectHeight = h - 4; // height - 4px (2px auf jeder Seite)
                
                // Erstelle einen abgerundeten Rechteck-Pfad
                // Starte von der oberen linken Ecke (nach dem Radius)
                const pathData = `M ${2 + r} ${2} ` + // Move to start (top-left after radius)
                               `L ${2 + rectWidth - r} ${2} ` + // Top edge
                               `A ${r} ${r} 0 0 1 ${2 + rectWidth} ${2 + r} ` + // Top-right corner
                               `L ${2 + rectWidth} ${2 + rectHeight - r} ` + // Right edge
                               `A ${r} ${r} 0 0 1 ${2 + rectWidth - r} ${2 + rectHeight} ` + // Bottom-right corner
                               `L ${2 + r} ${2 + rectHeight} ` + // Bottom edge
                               `A ${r} ${r} 0 0 1 ${2} ${2 + rectHeight - r} ` + // Bottom-left corner
                               `L ${2} ${2 + r} ` + // Left edge
                               `A ${r} ${r} 0 0 1 ${2 + r} ${2}`; // Top-left corner (close path)
                
                // Aktualisiere den Pfad
                borderFill.setAttribute('d', pathData);
                
                // Hole die exakte Pfadlänge mit getTotalLength()
                const perimeter = borderFill.getTotalLength();
                
                // Aktualisiere dasharray wenn Perimeter sich geändert hat (z.B. bei Resize)
                const currentPerimeter = parseFloat(borderFill.dataset.perimeter) || 0;
                if (Math.abs(currentPerimeter - perimeter) > 1 || !borderFill.dataset.perimeter) {
                    borderFill.style.strokeDasharray = `${perimeter}`;
                    borderFill.dataset.perimeter = perimeter;
                }
                
                // Berechne Offset mit sanftem Übergang
                // Es gibt 4 Fragen (Schritt 1-4), Welcome ist Schritt 0
                // Schritt 0 = 0%, Schritt 1 = 25%, Schritt 2 = 50%, Schritt 3 = 75%, Schritt 4 = 100%
                // Da totalSteps = 5 (Welcome + 4 Fragen), aber wir wollen 4 Schritte für 0-100%
                const totalProgressSteps = totalSteps - 1; // 4 Schritte (ohne Welcome)
                const progress = step === 0 ? 0 : step / totalProgressSteps; // Schritt 0 = 0%, Schritt 1 = 1/4 = 25%, etc.
                const dashOffset = perimeter * (1 - progress);
                
                // Zeige border-fill immer an (auch bei 0%), verstecke border-bg wenn Fortschritt > 0
                borderFill.style.opacity = '1';
                borderFill.classList.add('visible');
                if (borderBg) {
                    borderBg.style.opacity = step === 0 ? '1' : '0';
                }
                // Der CSS-Übergang auf stroke-dashoffset übernimmt die sanfte Animation
                borderFill.style.strokeDashoffset = dashOffset;
            });
        }
        
        // Event Listener für Resize hinzufügen
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Hole aktuellen Schritt aus dem Overlay (falls gespeichert)
                const currentStep = overlayElement.dataset.currentStep || 0;
                updateProgressLine(parseInt(currentStep));
            }, 100);
        });
        
        return {
            updateProgressLine: updateProgressLine
        };
    }
    
    // Initialisiere Progress Line
    let progressLine = null;
    if (questionnaireContainer) {
        progressLine = initProgressLine(questionnaireContainer, totalQuestions);
        // Speichere aktuellen Schritt im Container für Resize-Event
        questionnaireContainer.dataset.currentStep = 0;
    }
    
    // Helper functions
    function resetScales(questionElement = null) {
        const targetQuestions = questionElement ? [questionElement] : questions;
        targetQuestions.forEach(q => {
            const scales = q.querySelectorAll('.semantic-scale');
            scales.forEach((scale, index) => {
                scale.classList.toggle('active', index === 0);
            });
        });
    }
    
    function resetForm() {
        if (userNameInput) userNameInput.value = '';
        if (kanzleiNameInput) kanzleiNameInput.value = '';
        userName = '';
        kanzleiName = '';
        updateUserNameDisplay();
        const applicationEmail = document.getElementById('applicationEmail');
        const applicationMessage = document.getElementById('applicationMessage');
        if (applicationEmail) applicationEmail.value = '';
        if (applicationMessage) applicationMessage.value = '';
    }
    
    function resetSubmitButton() {
        const applicationSubmitButton = document.getElementById('applicationSubmitButton');
        const applicationSubmitCheck = document.querySelector('.application-submit-check');
        const applicationSubmitText = document.querySelector('.application-submit-text');
        if (applicationSubmitButton) {
            applicationSubmitButton.classList.remove('submitted');
            if (applicationSubmitText) gsap.set(applicationSubmitText, { opacity: 1, scale: 1 });
            if (applicationSubmitCheck) {
                applicationSubmitCheck.style.display = 'none';
                applicationSubmitCheck.classList.remove('visible');
                gsap.set(applicationSubmitCheck, { opacity: 0, scale: 0 });
                const checkPath = applicationSubmitCheck.querySelector('polyline');
                if (checkPath) {
                    checkPath.style.strokeDasharray = '';
                    checkPath.style.strokeDashoffset = '';
                }
            }
        }
    }
    
    function clearSelections() {
        document.querySelectorAll('.questionnaire-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelectorAll('.scale-point').forEach(pt => pt.classList.remove('selected'));
    }
    
    // Update user name display in all questions
    function updateUserNameDisplay() {
        if (userName && kanzleiName) {
            userNameDisplays.forEach(display => {
                if (display) display.textContent = `${userName} - ${kanzleiName}`;
            });
        }
        if (applicationUserName && userName) applicationUserName.textContent = userName;
        const applicationFullName = document.getElementById('applicationFullName');
        const applicationKanzleiNameField = document.getElementById('applicationKanzleiName');
        if (applicationFullName && userName) applicationFullName.value = userName;
        if (applicationKanzleiNameField && kanzleiName) applicationKanzleiNameField.value = kanzleiName;
    }
    
    // Check if welcome form is filled
    function checkWelcomeForm() {
        if (userNameInput && kanzleiNameInput && welcomeContinueBtn) {
            const nameFilled = userNameInput.value.trim().length > 0;
            const kanzleiFilled = kanzleiNameInput.value.trim().length > 0;
            welcomeContinueBtn.disabled = !(nameFilled && kanzleiFilled);
        }
    }
    
    // Handle welcome form inputs
    if (userNameInput) {
        userNameInput.addEventListener('input', () => {
            userName = userNameInput.value.trim();
            checkWelcomeForm();
        });
    }
    
    if (kanzleiNameInput) {
        kanzleiNameInput.addEventListener('input', () => {
            kanzleiName = kanzleiNameInput.value.trim();
            checkWelcomeForm();
        });
    }
    
    // Check if all scales in current question are answered
    function checkAllScalesAnswered() {
        const activeQuestion = document.querySelector('.questionnaire-question.active');
        if (!activeQuestion) return false;
        
        // Check for questionnaire-options (like question 2)
        const options = activeQuestion.querySelectorAll('.questionnaire-option');
        if (options.length > 0) {
            // For option-based questions, check if at least one is selected
            const hasSelected = Array.from(options).some(opt => opt.classList.contains('selected'));
            return hasSelected;
        }
        
        // Check for semantic scales
        const scales = activeQuestion.querySelectorAll('.semantic-scale');
        if (scales.length === 0) return true; // No scales, so it's answered
        
        let allAnswered = true;
        scales.forEach(scale => {
            const hasSelection = scale.querySelector('.scale-point.selected');
            if (!hasSelection) {
                allAnswered = false;
            }
        });
        
        return allAnswered;
    }
    
    // Update continue button state
    function updateContinueButton() {
        const activeQuestion = document.querySelector('.questionnaire-question.active');
        if (!activeQuestion) return;
        
        // Skip for welcome question (handled separately)
        if (parseInt(activeQuestion.dataset.question) === 0) return;
        
        const continueBtn = activeQuestion.querySelector('.questionnaire-continue-btn');
        if (continueBtn) {
            const allAnswered = checkAllScalesAnswered();
            continueBtn.disabled = !allAnswered;
        }
    }
    
    // Update progress - purple border and percentage
    function updateProgress() {
        const targetPercentage = currentQuestion === 0 ? 0 : Math.min(100, currentQuestion * 25);
        
        // Animate percentage using GSAP
        if (progressPercentage && progressPercentage2) {
            const percentageObj = { value: currentPercentage };
            gsap.to(percentageObj, {
                value: targetPercentage,
                duration: 3,
                ease: "power2.out",
                onUpdate: () => {
                    const rounded = Math.round(percentageObj.value);
                    progressPercentage.textContent = rounded + '%';
                    progressPercentage2.textContent = rounded + '%';
                },
                onComplete: () => {
                    progressPercentage.textContent = targetPercentage + '%';
                    progressPercentage2.textContent = targetPercentage + '%';
                    currentPercentage = targetPercentage;
                }
            });
        } else {
            currentPercentage = targetPercentage;
            if (progressPercentage) progressPercentage.textContent = targetPercentage + '%';
            if (progressPercentage2) progressPercentage2.textContent = targetPercentage + '%';
        }
        
        // Update progress points
        progressPoints?.forEach((point, index) => {
            point.classList.toggle('active', currentQuestion + 1 === index + 1);
        });
        
        // Update Progress Line
        if (progressLine && questionnaireContainer) {
            questionnaireContainer.dataset.currentStep = currentQuestion;
            progressLine.updateProgressLine(currentQuestion);
        }
    }
    
    // Display answers on the right side
    function displayAnswers() {
        const answersDisplay = document.getElementById('applicationAnswersDisplay');
        if (!answersDisplay) return;
        
        answersDisplay.innerHTML = '<div class="application-answers-title">[ANTWORTEN]</div>';
        
        for (let questionNum = 1; questionNum <= 3; questionNum++) {
            const questionAnswers = Array.from({ length: 3 }, (_, i) => {
                const answer = answers[`question${questionNum}_scale${i + 1}`];
                return answer?.value || '-';
            });
            
            if (questionAnswers.some(val => val !== '-')) {
                const answerItem = document.createElement('div');
                answerItem.className = 'application-answer-item';
                answerItem.innerHTML = `
                    <span class="application-answer-question">${questionNum}</span>
                    <span class="application-answer-separator">|</span>
                    <span class="application-answer-values">${questionAnswers.join(' - ')}</span>
                `;
                answersDisplay.appendChild(answerItem);
            }
        }
    }
    
    // Show specific question
    function showQuestion(questionNumber) {
        questions.forEach(q => {
            const qNum = parseInt(q.dataset.question);
            if (qNum === questionNumber) {
                q.classList.add('active');
            } else {
                q.classList.remove('active');
            }
        });
        currentQuestion = questionNumber;
        updateProgress();
        updateContinueButton();
        updateNavButtons();
        // Update username display when showing question 4
        if (questionNumber === 4) {
            updateUserNameDisplay();
        }
    }
    
    // Function to reset questionnaire
    function resetQuestionnaire() {
        Object.keys(answers).forEach(key => delete answers[key]);
        resetForm();
        resetSubmitButton();
        clearSelections();
        checkWelcomeForm();
        resetScales();
        showQuestion(0);
    }
    
    // Function to open questionnaire
    function openQuestionnaire() {
        if (questionnaireOverlay) {
            questionnaireOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        resetQuestionnaire();
    }
    
    // Function to close questionnaire
    function closeQuestionnaire() {
        if (questionnaireOverlay) {
            questionnaireOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        setTimeout(resetQuestionnaire, 500);
    }
    
    // Questionnaire open handlers (cardToggle and projectsLink are now links, so they're removed from here)
    [
        { el: document.getElementById('footerBewerbungButton'), preventDefault: true },
        { el: document.getElementById('footerBewerbungsformular'), preventDefault: true }
    ].forEach(({ el, preventDefault }) => {
        el?.addEventListener('click', (e) => {
            if (preventDefault) e.preventDefault();
            openQuestionnaire();
        });
    });
    
    // Handle mobile menu item
    document.querySelectorAll('.mobile-menu-item').forEach(item => {
        if (item.textContent.trim() === 'Bewerbungsformular') {
            item.addEventListener('click', () => {
                openQuestionnaire();
                if (typeof closeMobileMenu === 'function') closeMobileMenu();
            });
        }
    });
    
    // Close handlers
    questionnaireClose?.addEventListener('click', closeQuestionnaire);
    questionnaireOverlay?.addEventListener('click', (e) => {
        if (e.target === questionnaireOverlay) closeQuestionnaire();
    });
    
    // Application Submit Button Functionality
    function setupSubmitButton() {
        const applicationSubmitButton = document.getElementById('applicationSubmitButton');
        if (!applicationSubmitButton || applicationSubmitButton.hasAttribute('data-listener-added')) return;
        
        applicationSubmitButton.setAttribute('data-listener-added', 'true');
        const applicationSubmitText = applicationSubmitButton.querySelector('.application-submit-text');
        const applicationSubmitCheck = applicationSubmitButton.querySelector('.application-submit-check');
        const checkPath = applicationSubmitCheck?.querySelector('polyline');
        
        applicationSubmitButton.addEventListener('click', () => {
            if (applicationSubmitButton.classList.contains('submitted')) return;
            
            applicationSubmitButton.classList.add('submitted');
            
            if (applicationSubmitText) {
                gsap.to(applicationSubmitText, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in" });
            }
            
            if (applicationSubmitCheck) {
                applicationSubmitCheck.classList.add('visible');
                Object.assign(applicationSubmitCheck.style, { display: 'block', visibility: 'visible', opacity: '0' });
                gsap.set(applicationSubmitCheck, { opacity: 0, scale: 0, transformOrigin: "center center" });
                
                if (checkPath) {
                    const pathLength = checkPath.getTotalLength();
                    gsap.set(checkPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
                }
                
                setTimeout(() => {
                    const checkmarkTimeline = gsap.timeline();
                    checkmarkTimeline.to(applicationSubmitCheck, { scale: 1.2, opacity: 1, duration: 0.4, ease: "back.out(1.7)" })
                        .to(applicationSubmitCheck, { scale: 1, duration: 0.2, ease: "power2.out" });
                    if (checkPath) {
                        gsap.to(checkPath, { strokeDashoffset: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
                    }
                }, 50);
            }
            
            gsap.to(applicationSubmitButton, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
        });
    }
    
    // Setup submit button when question 4 is shown
    const originalShowQuestion = showQuestion;
    showQuestion = function(questionNumber) {
        originalShowQuestion(questionNumber);
        if (questionNumber === 4) setTimeout(setupSubmitButton, 100);
    };
    
    // Event Delegation - Handle all clicks on questionnaire container
    questionnaireContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle Continue Buttons
        const continueBtn = target.closest('.questionnaire-continue-btn');
        if (continueBtn && !continueBtn.disabled) {
            if (continueBtn.id === 'welcomeContinueBtn') {
                userName = userNameInput?.value.trim() || '';
                kanzleiName = kanzleiNameInput?.value.trim() || '';
                if (userName && kanzleiName) {
                    updateUserNameDisplay();
                    showQuestion(1);
                    resetScales(document.querySelector('.questionnaire-question.active'));
                }
            } else {
                if (currentQuestion < totalQuestions) {
                    showQuestion(currentQuestion + 1);
                    resetScales(document.querySelector('.questionnaire-question.active'));
                }
            }
            return;
        }
        
        // Handle Scale Points
        const scalePoint = target.closest('.scale-point');
        if (scalePoint) {
            e.stopPropagation();
            const scale = scalePoint.closest('.semantic-scale');
            if (scale && scale.classList.contains('active')) {
                const question = scale.closest('.questionnaire-question');
                const questionNum = parseInt(question?.dataset.question);
                const scaleIndex = parseInt(scale.dataset.scaleIndex);
                const scaleName = scale.dataset.scale;
                const value = scalePoint.dataset.value;
                const wasSelected = scalePoint.classList.contains('selected');
                
                scale.querySelectorAll('.scale-point').forEach(pt => pt.classList.remove('selected'));
                scalePoint.classList.add('selected');
                
                if (questionNum !== undefined) {
                    answers[`question${questionNum}_scale${scaleIndex}`] = {
                        question: questionNum,
                        scale: scaleName,
                        scaleIndex: scaleIndex,
                        value: parseInt(value),
                        label: scalePoint.dataset.label || value
                    };
                }
                
                if (!wasSelected && question) {
                    const allScales = question.querySelectorAll('.semantic-scale');
                    const nextScale = Array.from(allScales).find(s => 
                        parseInt(s.dataset.scaleIndex) === scaleIndex + 1
                    );
                    if (nextScale) {
                        setTimeout(() => {
                            nextScale.classList.add('active');
                            updateContinueButton();
                        }, 300);
                    } else {
                        updateContinueButton();
                    }
                }
            }
            return;
        }
        
        // Handle Semantic Scales (click on scale to reactivate)
        const semanticScale = target.closest('.semantic-scale');
        if (semanticScale && !target.closest('.scale-point')) {
            const question = semanticScale.closest('.questionnaire-question');
            if (question && (!semanticScale.classList.contains('active') || target.closest('.scale-labels'))) {
                const clickedScaleIndex = parseInt(semanticScale.dataset.scaleIndex);
                question.querySelectorAll('.semantic-scale').forEach((s) => {
                    const sIndex = parseInt(s.dataset.scaleIndex);
                    if (sIndex <= clickedScaleIndex) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                        s.querySelectorAll('.scale-point').forEach(pt => pt.classList.remove('selected'));
                    }
                });
                updateContinueButton();
            }
            return;
        }
        
        // Handle Questionnaire Options
        const option = target.closest('.questionnaire-option');
        if (option) {
            const question = option.closest('.questionnaire-question');
            const questionNum = parseInt(question?.dataset.question);
            const options = question?.querySelectorAll('.questionnaire-option') || [];
            
            if (questionNum === 2) {
                option.classList.toggle('selected');
                answers[questionNum] = Array.from(options)
                    .filter(opt => opt.classList.contains('selected'))
                    .map(opt => opt.dataset.option);
            } else {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                answers[questionNum] = option.dataset.option;
                setTimeout(() => {
                    if (currentQuestion < totalQuestions) {
                        showQuestion(currentQuestion + 1);
                    }
                }, 600);
            }
            updateContinueButton();
            return;
        }
        
        // Handle Progress Points
        const progressPoint = target.closest('.progress-point');
        if (progressPoint) {
            const questionNum = parseInt(progressPoint.dataset.question);
            if (!isNaN(questionNum)) {
                showQuestion(questionNum);
                resetScales(document.querySelector('.questionnaire-question.active'));
            }
            return;
        }
    });
    
    // Mobile Navigation Arrows
    const navLeft = document.getElementById('questionnaireNavLeft');
    const navRight = document.getElementById('questionnaireNavRight');
    
    function updateNavButtons() {
        if (navLeft) navLeft.disabled = currentQuestion === 0;
        if (navRight) navRight.disabled = currentQuestion >= totalQuestions;
    }
    
    if (navLeft) {
        navLeft.addEventListener('click', () => {
            if (currentQuestion > 0) showQuestion(currentQuestion - 1);
        });
    }
    
    if (navRight) {
        navRight.addEventListener('click', () => {
            if (currentQuestion < totalQuestions) showQuestion(currentQuestion + 1);
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && questionnaireOverlay && questionnaireOverlay.classList.contains('active')) {
            closeQuestionnaire();
        }
    });
    
    // Initialize progress and welcome form
    updateProgress();
    checkWelcomeForm();
    updateNavButtons();
    if (welcomeContinueBtn) {
        welcomeContinueBtn.disabled = true;
    }
    
    // Initialize questionnaire on page load if no overlay (for test.html)
    if (!questionnaireOverlay) {
        // Show first question by default
        showQuestion(0);
    }
}

onDOMReady(initQuestionnaire);

let loadingAnimationStarted = false;

function animateLoadingLine() {
    if (loadingAnimationStarted) return;
    loadingAnimationStarted = true;
    
    if (shouldDisableAnimation('noPreloader')) {
        document.body.style.backgroundColor = '#000000';
        document.body.classList.add('scrollable');
        makeMenuVisibleImmediately();
        transitionToLightMode();
        return;
    }
    
    const loadingLineFill = cachedElements.loadingLineFill || document.getElementById('loadingLineFill');
    const loadingNumber = cachedElements.loadingNumber || document.getElementById('loadingNumber');
    
    if (!loadingLineFill || !loadingNumber) {
        transitionToLightMode();
        return;
    }
    
    gsap.to(loadingLineFill, {
        height: '100%',
        duration: 1.5,
        ease: "power1.out",
        onUpdate: function() {
            loadingNumber.innerText = Math.floor(this.progress() * 100);
        },
        onComplete: () => {
            setTimeout(() => transitionToLightMode(), 200);
        }
    });
}

function transitionToLightMode() {
    const heroSection = cachedElements.heroSection || document.getElementById('heroSection');
    const body = document.body;
    const loadingNumber = cachedElements.loadingNumber || document.getElementById('loadingNumber');
    const centerLinks = cachedElements.centerLinks || document.getElementById('centerLinks');
    const navigationContainer = cachedElements.navigationContainer || document.querySelector('.navigation-container');
    const mobileBurger = cachedElements.mobileBurger || document.getElementById('mobileBurger');
    
    const tl = gsap.timeline({
        onComplete: () => {
            body.classList.add('scrollable');
            const isMobile = isMobileDevice();
            
            if (!isMobile) {
                const pilcrow = cachedElements.pilcrow || document.getElementById('pilcrowSymbol');
                const heroTitle = cachedElements.heroTitle || document.querySelector('.hero-title');
                const heroDescription = cachedElements.heroDescription || document.querySelector('.hero-description');
                
                const heroScrollTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: 'body',
                        start: 'top top',
                        end: '+=1000vh',
                        scrub: true,
                        refreshPriority: -1,
                        fastScrollEnd: true
                    }
                });
                
                heroScrollTimeline.to(heroSection, {
                    y: '-100%',
                    ease: 'none',
                    force3D: true,
                    immediateRender: false
                }, 0);
                
                const textScrollTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: 'body',
                        start: 'top top',
                        end: '+=800vh',
                        scrub: true,
                        refreshPriority: -1,
                        fastScrollEnd: true
                    }
                });
                
                if (pilcrow) {
                    textScrollTimeline.to(pilcrow, {
                        x: '-120%',
                        ease: 'none',
                        force3D: true,
                        immediateRender: false
                    }, 0);
                }
                
                if (heroTitle) {
                    textScrollTimeline.to(heroTitle, {
                        x: '120%',
                        ease: 'none',
                        force3D: true,
                        immediateRender: false
                    }, 0);
                }
                
                if (heroDescription) {
                    textScrollTimeline.to(heroDescription, {
                        x: '120%',
                        ease: 'none',
                        force3D: true,
                        immediateRender: false
                    }, 0);
                }
            }

            const cardToggle = document.getElementById('cardToggle');
            if (cardToggle) {
                ScrollTrigger.create({
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: false,
                    onEnter: () => cardToggle.classList.add('visible'),
                    onLeaveBack: () => cardToggle.classList.remove('visible')
                });
            }
        }
    });
    
    body.style.backgroundColor = '#000000';
    
    if (!shouldDisableAnimation('noPreloader')) {
        const loadingLine = document.querySelector('.loading-line');
        if (loadingLine) {
            gsap.killTweensOf(loadingLine);
            gsap.killTweensOf(loadingNumber);
            
            gsap.to(loadingLine, {
                y: '100vh',
                duration: 0.6,
                ease: "power2.in",
                onComplete: () => {
                    loadingLine.style.display = 'none';
                    if (loadingNumber) {
                        loadingNumber.style.display = 'none';
                        loadingNumber.innerText = 0;
                    }
                }
            });
        }
    }
    
    if (!shouldDisableAnimation('noMenuAnimation')) {
        tl.fromTo(centerLinks, {
            opacity: 0,
            y: 0
        }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, 1.0);
        
        gsap.set(mobileBurger, { xPercent: -50 });
        
        tl.fromTo(mobileBurger, {
            opacity: 0,
            y: -20
        }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, 1.0);
        
        if (navigationContainer) {
            tl.fromTo(navigationContainer, {
                opacity: 0
            }, {
                opacity: 1,
                duration: 0.8,
                ease: "power3.out"
            }, 1.1);
        }
    } else {
        if (centerLinks) gsap.set(centerLinks, { opacity: 1, immediateRender: true });
        if (mobileBurger) gsap.set(mobileBurger, { opacity: 1, xPercent: -50, immediateRender: true });
        if (navigationContainer) {
            gsap.set(navigationContainer, { opacity: 1, immediateRender: true });
            // GSAP-Kontrolle über y entfernen, damit CSS die Transform kontrollieren kann
            gsap.set(navigationContainer, { clearProps: 'y' });
        }
    }
}

onDOMReady(() => {
    makeMenuVisibleImmediately();
    makeHeaderScrollable();
});

const initLoadingAnimation = () => {
    const start = () => setTimeout(animateLoadingLine, 300);
    if (typeof gsap === 'undefined') {
        let attempts = 0;
        const check = setInterval(() => {
            if (typeof gsap !== 'undefined' || ++attempts >= 100) {
                clearInterval(check);
                if (typeof gsap !== 'undefined') start();
            }
        }, 50);
    } else {
        start();
    }
};
onDOMReady(initLoadingAnimation);

// Benutzerdefinierter Cursor - Performance-optimiert
const customCursor = document.getElementById('customCursor');
const cursorImage = document.getElementById('cursorImage');
const cursorImageSrc = document.getElementById('cursorImageSrc');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let imageX = 0;
let imageY = 0;
let isInitialized = false;
let rafId = null;
let lastUpdateTime = 0;
const throttleMs = 16; // ~60fps max

// Maus-Position tracken
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Initial position sofort setzen (ohne Smooth-Animation beim ersten Mal)
    if (!isInitialized && customCursor) {
        cursorX = mouseX;
        cursorY = mouseY;
        imageX = mouseX;
        imageY = mouseY;
        
        // Verwende transform für bessere Performance
        customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        cursorImage.style.transform = `translate(${imageX}px, ${imageY}px) translate(-50%, -50%)`;
        
        customCursor.classList.add('initialized');
        isInitialized = true;
    }
    
    // Starte Animation nur wenn nicht bereits läuft
    if (isInitialized && !rafId) {
        updateCursor();
    }
});

// Optimierte Update-Funktion mit requestAnimationFrame
function updateCursor() {
    const now = performance.now();
    
    // Throttle auf ~60fps für bessere CPU-Performance
    if (now - lastUpdateTime < throttleMs) {
        rafId = requestAnimationFrame(updateCursor);
        return;
    }
    
    lastUpdateTime = now;
    
    const speed = 0.15;
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    // Nur updaten wenn Bewegung signifikant ist (> 0.5px)
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        rafId = null; // Stoppe Animation wenn nahe genug
        return;
    }
    
    cursorX += dx * speed;
    cursorY += dy * speed;
    
    // Verwende transform statt left/top (GPU-beschleunigt, kein Reflow)
    customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    
    // Bild folgt auch der Maus, aber mit mehr Abstand
    const imageSpeed = 0.1;
    const imageDx = mouseX - imageX;
    const imageDy = mouseY - imageY;
    
    if (Math.abs(imageDx) > 0.5 || Math.abs(imageDy) > 0.5) {
        imageX += imageDx * imageSpeed;
        imageY += imageDy * imageSpeed;
        cursorImage.style.transform = `translate(${imageX}px, ${imageY}px) translate(-50%, -50%)`;
    }
    
    rafId = requestAnimationFrame(updateCursor);
}

// Cursor größer machen bei Hover über anklickbare Elemente
function initClickableCursor() {
    if (!customCursor) return;
    
    // Selektoren für alle anklickbaren Elemente
    // Hinweis: .client-item hat bereits einen eigenen hover State und wird separat behandelt
    const clickableSelectors = [
        'a',
        'button',
        '[onclick]',
        '[role="button"]',
        '.center-link',
        '.contact-link',
        '.location-link',
        '.card-toggle',
        '.mobile-menu-item',
        '.footer-button',
        '.footer-link',
        '.questionnaire-option',
        '.questionnaire-continue-btn',
        '.application-submit-button',
        '.application-contact-link',
        '.card-switch',
        '.close-button',
        '.questionnaire-close',
        '.cookie-banner-btn',
        '.scroll-hint',
        '.progress-point',
        '.scale-point'
    ];
    
    // Alle anklickbaren Elemente finden
    const clickableElements = document.querySelectorAll(clickableSelectors.join(','));
    
    clickableElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            // Nur hinzufügen, wenn nicht bereits hover aktiv ist
            // Ignoriere client-items, da diese ihren eigenen hover State haben
            if (!customCursor.classList.contains('hover') && 
                !element.classList.contains('client-item')) {
                customCursor.classList.add('clickable');
            }
        });
        
        element.addEventListener('mouseleave', () => {
            customCursor.classList.remove('clickable');
        });
    });
    
    // Auch für dynamisch hinzugefügte Elemente funktionieren (MutationObserver)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Prüfe ob das neue Element oder seine Kinder anklickbar sind
                    const newClickables = node.matches && node.matches(clickableSelectors.join(',')) 
                        ? [node] 
                        : (node.querySelectorAll ? node.querySelectorAll(clickableSelectors.join(',')) : []);
                    
                    newClickables.forEach(element => {
                        element.addEventListener('mouseenter', () => {
                            if (!customCursor.classList.contains('hover') && 
                                !element.classList.contains('client-item')) {
                                customCursor.classList.add('clickable');
                            }
                        });
                        
                        element.addEventListener('mouseleave', () => {
                            customCursor.classList.remove('clickable');
                        });
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

onDOMReady(initClickableCursor);

// Client Container Animation - Fade in when hero section is scrolled away
const clientContainer = document.getElementById('clientContainer');
const heroSection = cachedElements.heroSection || document.getElementById('heroSection');

if (clientContainer && heroSection) {
    const isMobile = isMobileDevice();
    
    if (isMobile) {
        // Auf Mobile: Keine Animation, sofort sichtbar
        gsap.set(clientContainer, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            force3D: true
        });
    } else {
        // Auf Desktop: Fade-In Animation
        gsap.set(clientContainer, {
            opacity: 0,
            y: 80,
            scale: 0.9,
            filter: "blur(10px)",
            force3D: true
        });
        
        gsap.to(clientContainer, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            ease: "sine.out",
            force3D: true,
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "bottom top",
                scrub: true,
                refreshPriority: -1
            }
        });
    }
}


// Client Hover and Click Interaction
const clientItems = document.querySelectorAll('.client-item');
const clientImages = document.querySelectorAll('.client-image');
const logoDisplay = document.getElementById('logoDisplay');
const logoItems = document.querySelectorAll('.logo-item');
const defaultCircle = logoItems[0]; // First item is the default circle

let hoveredIndex = -1;
let clickedIndex = 0; // Start with first item selected
let currentLogoIndex = 1; // Start with first logo visible (index 0 is default circle, index 1 is first client logo)
let logoTimeline = null;

// Function to smoothly animate client images
const imageAnimations = new Map();

function animateClientImage(targetImage, show = true) {
    if (!targetImage) return;
    
    // Kill any existing animation for this image
    if (imageAnimations.has(targetImage)) {
        imageAnimations.get(targetImage).kill();
        imageAnimations.delete(targetImage);
    }
    
    if (show) {
        // Show image instantly without fade
        gsap.set(targetImage, {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
        });
    } else {
        // Hide image instantly without fade
        gsap.set(targetImage, {
            opacity: 0,
            scale: 1,
            filter: "blur(0px)"
        });
    }
}

// Video sources mapping
const videoSources = {
    0: 'staff.mp4',
    1: 'htw.mp4',
    2: 'yndygo.mp4',
    3: 'BehindBars.mov',
    4: 'concept.mp4'
};

// Consolidated video control functions
function loadAndPlayVideo(videoIndex) {
    const video = document.querySelector(`video.client-image[data-index="${videoIndex}"]`);
    if (!video || !videoSources[videoIndex]) return;
    
    if (!video.src) {
        video.src = videoSources[videoIndex];
        video.load();
    }
    
    const playVideo = () => video.play().catch(() => {});
    if (video.readyState >= 2) {
        playVideo();
    } else {
        video.addEventListener('canplay', playVideo, { once: true });
    }
}

function pauseVideo(videoIndex) {
    const video = document.querySelector(`video.client-image[data-index="${videoIndex}"]`);
    if (video && !video.paused) {
        video.pause();
        video.currentTime = 0;
    }
}

// Initialize all client images with GSAP
clientImages.forEach((img, index) => {
    if (index === 0) {
        // Show first image by default
        gsap.set(img, {
            opacity: 1,
            scale: 1,
            y: 0
        });
        img.classList.add('active', 'clicked');
        // Video wird erst geladen, wenn es sichtbar wird oder beim ersten Hover/Click
        // NICHT sofort laden für bessere Performance
        // if (videoSources[0]) {
        //     loadAndPlayVideo(0);
        // }
    } else {
        gsap.set(img, {
            opacity: 0,
            scale: 0.95,
            y: 0
        });
        img.classList.remove('active', 'hovered', 'clicked');
    }
});

// Helper function to show/hide client images
function setClientImageState(targetIndex, state = 'active') {
    clientImages.forEach((img, imgIndex) => {
        if (imgIndex === targetIndex) {
            img.classList.add('active', state);
            img.classList.remove('hovered', state === 'clicked' ? 'hovered' : 'clicked');
            animateClientImage(img, true);
            if (videoSources[imgIndex]) loadAndPlayVideo(imgIndex);
        } else {
            if (state === 'clicked' || !img.classList.contains('clicked')) {
                img.classList.remove('active', 'hovered', 'clicked');
                animateClientImage(img, false);
            }
            if (videoSources[imgIndex] && imgIndex !== targetIndex) pauseVideo(imgIndex);
        }
    });
}

// Function to switch logo with animation
function switchLogo(newIndex) {
    // newIndex: -1 = show default, 0-3 = show client logo (but in array it's 1-4)
    const actualIndex = newIndex === -1 ? 0 : newIndex + 1;
    
    if (currentLogoIndex === actualIndex) return;
    
    // Kill any existing timeline to prevent stacking
    if (logoTimeline) {
        logoTimeline.kill();
    }
    
    // Hide ALL logos immediately first
    logoItems.forEach((logo, i) => {
        if (i !== actualIndex) {
            gsap.set(logo, {
                opacity: 0,
                scale: 0,
                display: 'none'
            });
        }
    });
    
    // Create new timeline
    logoTimeline = gsap.timeline();
    
    // Show the target logo
    if (logoItems[actualIndex]) {
        logoTimeline
            .set(logoItems[actualIndex], { 
                display: 'flex',
                opacity: 0,
                scale: 0
            })
            .to(logoItems[actualIndex], {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
    }
    
    currentLogoIndex = actualIndex;
}

// Initialize first client item as clicked on load (logo is already visible via CSS)
if (clientItems[0]) {
    clientItems[0].classList.add('clicked');
}
// Set currentLogoIndex to match the visible logo (first client logo is at array index 1)
currentLogoIndex = 1;

// Load and play staff.mp4 immediately on page load (no lazy loading)
onDOMReady(() => {
    const firstVideo = document.querySelector(`video.client-image[data-index="0"]`);
    if (firstVideo && videoSources[0]) {
        firstVideo.src = videoSources[0];
        firstVideo.load();
        firstVideo.play().catch(err => {
        });
    }
});

// Logo hover rotation animation - 360 degrees with ease-in-out
if (logoDisplay) {
    let rotationTimeline = null;
    
    logoDisplay.addEventListener('mouseenter', () => {
        // Kill any existing rotation animation
        if (rotationTimeline) {
            rotationTimeline.kill();
        }
        
        // Get current rotation
        const currentRotation = gsap.getProperty(logoDisplay, "rotation") || 0;
        
        // Create rotation animation - 360 degrees from current position
        rotationTimeline = gsap.to(logoDisplay, {
            rotation: currentRotation + 360,
            duration: 0.8,
            ease: "power2.inOut", // ease-in-out
            transformOrigin: "center center"
        });
    });
}

clientItems.forEach((item, index) => {
    // Hover handlers - show image and logo temporarily
    item.addEventListener('mouseenter', () => {
        customCursor.classList.remove('clickable'); // Remove clickable, use hover instead
        customCursor.classList.add('hover');
        hoveredIndex = index;
        
        // Load and play video if it's a video element
        if (videoSources[index]) {
            loadAndPlayVideo(index);
        }
        
        // Only show image on hover if no item is clicked, or if hovering over a different item
        if (clickedIndex === -1 || clickedIndex !== index) {
            const targetImage = clientImages[index];
            const isTargetImageAlreadyActive = targetImage && targetImage.classList.contains('active') && !targetImage.classList.contains('clicked');
            
            // Remove hover class from all images first
            clientImages.forEach((img, imgIndex) => {
                img.classList.remove('hovered');
                // Pause all videos that are not the target (including clicked ones when hovering over different item)
                if (imgIndex !== index && videoSources[imgIndex]) {
                    pauseVideo(imgIndex);
                }
                // Only hide images that are not the target and not clicked
                if (imgIndex !== index && img.classList.contains('active') && !img.classList.contains('clicked')) {
                    img.classList.remove('active');
                    animateClientImage(img, false);
                }
            });
            
            // Show the hovered image instantly
            if (targetImage) {
                if (!isTargetImageAlreadyActive) {
                    // Image is not active, show it instantly
                    targetImage.classList.add('active', 'hovered');
                    targetImage.classList.remove('clicked');
                    animateClientImage(targetImage, true);
                } else {
                    // Image is already active, just update classes
                    targetImage.classList.add('hovered');
                    targetImage.classList.remove('clicked');
                }
            }
            
            // Update logo for hover - always show logo when hovering
            switchLogo(index);
        }
    });

    item.addEventListener('mouseleave', () => {
        customCursor.classList.remove('hover');
        hoveredIndex = -1;
        
        // Always restore to the clicked/selected item's logo and image
        // clickedIndex should never be -1 (starts at 0), but ensure it's valid
        const targetIndex = clickedIndex >= 0 ? clickedIndex : 0;
        
        // Pause all videos except the clicked one
        clientImages.forEach((img, imgIndex) => {
            if (imgIndex !== targetIndex && videoSources[imgIndex]) {
                pauseVideo(imgIndex);
            }
        });
        
        // Restore the clicked image
        clientImages.forEach((img, imgIndex) => {
            img.classList.remove('hovered');
            // Only hide images that are not the clicked one
            if (imgIndex !== targetIndex && img.classList.contains('active') && !img.classList.contains('clicked')) {
                img.classList.remove('active');
                animateClientImage(img, false);
            }
        });
        
        // Ensure clicked image is visible with correct z-index
        if (clientImages[targetIndex]) {
            // If clicked image is not active, show it instantly
            if (!clientImages[targetIndex].classList.contains('active')) {
                clientImages[targetIndex].classList.add('active', 'clicked');
                clientImages[targetIndex].classList.remove('hovered');
                animateClientImage(clientImages[targetIndex], true);
                // Play video if it's the clicked item
                if (videoSources[targetIndex]) {
                    loadAndPlayVideo(targetIndex);
                }
            } else {
                // Just update classes to ensure correct z-index
                clientImages[targetIndex].classList.add('clicked');
                clientImages[targetIndex].classList.remove('hovered');
                // Play video if it's the clicked item
                if (videoSources[targetIndex]) {
                    loadAndPlayVideo(targetIndex);
                }
            }
        }
        
        // Always jump back to the clicked/selected item's logo
        switchLogo(targetIndex);
    });

    // Click handler - navigate to project page
    item.addEventListener('click', () => {
        const projectPages = {
            0: 'staffconnect.html',
            1: 'htw.html',
            2: 'yndygo.html',
            3: 'behindbars.html',
            4: 'concept.html'
        };
        
        if (projectPages[index]) {
            window.location.href = projectPages[index];
        }
    });
});

// Project data for overlay
const projectData = {
    0: {
        name: 'STAFFCONNECT',
        year: '2024',
        services: ['WEB DEVELOPMENT', 'UI/UX DESIGN', 'REACT', 'NODE.JS', 'DATABASE DESIGN', 'API INTEGRATION'],
        summary: 'Entwicklung einer modernen Personalverwaltungsplattform für Unternehmen. Die Lösung ermöglicht effizientes Management von Mitarbeitern, Schichtplanung und Kommunikation in Echtzeit.',
        link: '#'
    },
    1: {
        name: 'HTW',
        year: '2024',
        services: ['WEB DESIGN', 'FRONTEND DEVELOPMENT', 'RESPONSIVE DESIGN', 'ACCESSIBILITY', 'CMS INTEGRATION'],
        summary: 'Redesign und Entwicklung der Website für die Hochschule für Technik und Wirtschaft Berlin. Fokus auf moderne Benutzerführung, Barrierefreiheit und optimale Darstellung auf allen Geräten.',
        link: '#'
    },
    2: {
        name: 'YNDYGO',
        year: '2024',
        services: ['BRANDING', 'WEB DEVELOPMENT', 'E-COMMERCE', 'PAYMENT INTEGRATION', 'MOBILE OPTIMIZATION'],
        summary: 'Komplette digitale Transformation für YNDYGO mit neuem Branding, E-Commerce-Plattform und nahtloser Payment-Integration. Die Lösung bietet eine intuitive Shopping-Erfahrung auf allen Geräten.',
        link: '#'
    },
    3: {
        name: 'BEHINDBARS',
        year: '2024',
        services: ['WEB DESIGN', 'CONTENT STRATEGY', 'VIDEO INTEGRATION', 'SOCIAL MEDIA INTEGRATION', 'ANIMATION'],
        summary: 'Entwicklung einer immersiven Website für BehindBars mit Fokus auf Storytelling und visuelle Erzählung. Integration von Video-Content und interaktiven Elementen für eine einzigartige Nutzererfahrung.',
        link: '#'
    },
    4: {
        name: 'CONCEPT',
        year: '2025',
        services: ['CONCEPT DESIGN', 'PROTOTYPING', 'USER RESEARCH', 'UI/UX DESIGN', 'DESIGN SYSTEM'],
        summary: 'Entwicklung eines innovativen Konzepts für eine neue digitale Plattform. Von der ersten Idee über User Research bis hin zum finalen Design-System - ein vollständiger Design-Thinking-Prozess.',
        link: '#'
    }
};

// Client Overlay Functions
function openClientOverlay(clientIndex) {
    const overlay = document.getElementById('clientOverlay');
    const data = projectData[clientIndex];
    
    if (!overlay || !data) return;
    
    // Update overlay content
    document.getElementById('clientOverlayName').textContent = data.name;
    document.getElementById('clientOverlayYear').textContent = data.year;
    document.getElementById('clientOverlaySummary').textContent = data.summary;
    document.getElementById('clientOverlayLink').href = data.link;
    
    // Update services
    const servicesContainer = document.getElementById('clientOverlayServices');
    servicesContainer.innerHTML = '';
    data.services.forEach(service => {
        const tag = document.createElement('div');
        tag.className = 'client-overlay-service-tag';
        tag.textContent = service;
        servicesContainer.appendChild(tag);
    });
    
    // Show overlay with animation
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate content in
    const content = overlay.querySelector('.client-overlay-content');
    gsap.fromTo(content, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
}

function closeClientOverlay() {
    const overlay = document.getElementById('clientOverlay');
    if (!overlay) return;
    
    const content = overlay.querySelector('.client-overlay-content');
    gsap.to(content, {
        opacity: 0,
        y: 30,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Initialize overlay close button
const overlayCloseBtn = document.getElementById('clientOverlayClose');
if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener('click', closeClientOverlay);
}

// Close overlay on background click
const overlay = document.getElementById('clientOverlay');
if (overlay) {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeClientOverlay();
        }
    });
}

// Close overlay on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('clientOverlay');
        if (overlay && overlay.classList.contains('active')) {
            closeClientOverlay();
        }
    }
});

// Main Section Scroll Up Animation
const mainSection = cachedElements.mainSection || document.getElementById('mainSection');
const spacerSection = document.getElementById('spacerSection');

if (mainSection && spacerSection) {
    // Mobile-Erkennung für optimierte Performance
    const isMobile = isMobileDevice();
    
    // Auf Mobile: Keine Animation, einfach normal scrollen
    if (isMobile) {
        // Mobile: Main Section einfach normal scrollen lassen, kein sticky, keine Animation
        mainSection.style.position = 'relative';
        mainSection.style.top = 'auto';
    } else {
        // Desktop: Main Section Animation mit sticky
        // Set initial opacity
        gsap.set(mainSection, { opacity: 1 });
        
        // Animate the main section to scroll up and fade out
        gsap.to(mainSection, {
            y: '-100vh',
            opacity: 0,
            ease: 'none',
            force3D: true,
            immediateRender: false,
            scrollTrigger: {
                trigger: spacerSection,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: true,
                refreshPriority: -1,
                fastScrollEnd: true,
                onLeave: () => {
                    // After scrolling up, remove sticky
                    mainSection.style.position = 'relative';
                },
                onEnterBack: () => {
                    // When scrolling back up, restore sticky and opacity
                    mainSection.style.position = 'sticky';
                    mainSection.style.top = '0';
                    gsap.set(mainSection, { opacity: 1 });
                }
            }
        });
    }
}


// Mobile Burger Menu GSAP Animation
const mobileBurgerBtn = document.getElementById('mobileBurger');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
let mobileMenuOpen = false;

function openMobileMenu() {
    if (mobileMenuOpen) return;
    mobileMenuOpen = true;
    
    mobileBurgerBtn.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    
    // GSAP Timeline für Menü öffnen
    const tl = gsap.timeline();
    
    // Overlay von oben nach unten kommen (ease-out)
    tl.fromTo(mobileMenuOverlay, {
        y: '-100%'
    }, {
        y: '0%',
        duration: 0.6,
        ease: "power2.out"
    });
    
    // Burger zu X transformieren
    tl.to(mobileBurgerBtn.children[0], {
        rotation: 45,
        y: 7,
        duration: 0.3,
        ease: "power2.out"
    }, 0);
    
    tl.to(mobileBurgerBtn.children[1], {
        opacity: 0,
        duration: 0.2,
        ease: "power2.out"
    }, 0);
    
    tl.to(mobileBurgerBtn.children[2], {
        rotation: -45,
        y: -7,
        duration: 0.3,
        ease: "power2.out"
    }, 0);
    
    // Menu Items nacheinander einblenden mit stagger
    tl.to(mobileMenuItems, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
    }, 0.3);
}

function closeMobileMenu() {
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    
    mobileBurgerBtn.classList.remove('active');
    
    // GSAP Timeline für Menü schließen
    const tl = gsap.timeline({
        onComplete: () => {
            mobileMenuOverlay.classList.remove('active');
            // Reset overlay position
            gsap.set(mobileMenuOverlay, { y: '-100%' });
        }
    });
    
    // Menu Items ausblenden
    tl.to(mobileMenuItems, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in"
    });
    
    // Burger zurück transformieren
    tl.to(mobileBurgerBtn.children[0], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
    }, 0.2);
    
    tl.to(mobileBurgerBtn.children[1], {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
    }, 0.2);
    
    tl.to(mobileBurgerBtn.children[2], {
        rotation: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
    }, 0.2);
    
    // Overlay nach oben raus
    tl.to(mobileMenuOverlay, {
        y: '-100%',
        duration: 0.5,
        ease: "power2.in"
    }, 0.1);
}

// Event Listeners
if (mobileBurgerBtn) {
    mobileBurgerBtn.addEventListener('click', () => {
        if (mobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

// Mobile Menu Submenu Toggle
const mobileMenuHeaders = document.querySelectorAll('.mobile-menu-header');
mobileMenuHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const subitems = header.nextElementSibling;
        if (subitems && subitems.classList.contains('mobile-menu-subitems')) {
            const isActive = header.classList.contains('active');
            
            // Toggle active state
            header.classList.toggle('active');
            subitems.classList.toggle('active');
            
            // Animate subitems
            if (!isActive) {
                // Opening - ensure display is set first
                subitems.style.display = 'flex';
                const subitemElements = subitems.querySelectorAll('.mobile-menu-subitem');
                gsap.fromTo(subitemElements, {
                    opacity: 0,
                    y: -10
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.05,
                    ease: "power2.out"
                });
            } else {
                // Closing
                const subitemElements = subitems.querySelectorAll('.mobile-menu-subitem');
                gsap.to(subitemElements, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    stagger: 0.03,
                    ease: "power2.in",
                    onComplete: () => {
                        subitems.style.display = 'none';
                    }
                });
            }
        }
    });
});

// Menu Items Click - Nur schließen wenn kein Link (z.B. Bewerbungsformular)
mobileMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Wenn es ein Header ist, wird es von der obigen Funktion gehandhabt
        if (item.classList.contains('mobile-menu-header')) {
            return;
        }
        
        // Wenn es ein Link ist, wird die Navigation von initPageTransitions() gehandhabt
        // Overlay wird nicht geschlossen, damit die Transition flüssig ist
        if (!item.href || item.tagName !== 'A') {
            closeMobileMenu();
        }
    });
});

// ESC zum Schließen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
    }
});

// Studio Section Scroll Animation with SplitText
const studioSection = cachedElements.studioSection || document.getElementById('studioSection');
const studioText = document.getElementById('studioText');

if (studioSection && studioText) {
    // Detect mobile device for performance optimizations
    const isMobile = isMobileTablet();
    
    // Split the text into words
    const split = new SplitText(studioText, { 
        type: "words",
        wordsClass: "word"
    });
    
    const words = split.words;
    
    // Map specific words to highlight - with their exact text
    const highlightWords = [
        { text: "Mission", exact: true },
        { text: "rechtssichere", exact: true },
        { text: "Website", exact: true },
        { text: "digitale Formulare", exact: true },
        { text: "effizient", exact: true }
    ];
    
    // Set initial state for all words explicitly with GSAP
    // PERFORMANCE: Blur nur auf Desktop, nicht auf Mobile
    words.forEach((word, index) => {
        const wordText = word.textContent.trim();
        
        // Set initial animation state - blur und scale nur auf Desktop
        const initialProps = {
            opacity: 0,
            y: 50,
            force3D: true
        };
        
        // Scale und Blur nur auf Desktop hinzufügen (Mobile zu langsam)
        if (!isMobile) {
            initialProps.scale = 0.8;
            initialProps.filter = "blur(10px)";
        }
        
        gsap.set(word, initialProps);
        
        // Find and highlight specific words
        highlightWords.forEach(hw => {
            if (wordText === hw.text || wordText.includes(hw.text.replace('.', ''))) {
                // Set the word to bold immediately
                gsap.set(word, { fontWeight: 700 });
            }
        });
    });
    
    // Create master timeline for the studio section
    // PERFORMANCE: Kürzere Scroll-Dauer auf Mobile + besserer Scrub
    const scrollDuration = isMobile ? "+=300%" : "+=500%"; // Kürzer auf Mobile = weniger Scroll-Events
    
    const studioTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: cachedElements.studioSection || studioSection,
            start: "top top",
            end: scrollDuration,
            scrub: isMobile ? 1.2 : 0.5, // Mehr Delay auf Mobile = viel weniger Recalculations
            pin: true,
            anticipatePin: 1,
            refreshPriority: 1,
            invalidateOnRefresh: false,
            markers: false,
            onEnter: () => {
                // Sicherstellen, dass Wörter initialisiert sind wenn Section sichtbar wird
                words.forEach((word) => {
                    const initialProps = {
                        opacity: 0,
                        y: 50,
                        force3D: true
                    };
                    
                    // Scale nur auf Desktop - auf Mobile zu teuer
                    if (!isMobile) {
                        initialProps.scale = 0.8;
                        initialProps.filter = "blur(10px)";
                    }
                    
                    gsap.set(word, initialProps);
                });
            }
        }
    });
    
    // Subtle background color shift during animation
    // PERFORMANCE: Nur auf Desktop, auf Mobile zu teuer
    // WICHTIG: Keine Opacity-Änderungen - klare Kanten zwischen Sections
    if (!isMobile) {
        // Sicherstellen dass Studio Section immer vollständig sichtbar ist
        gsap.set(studioSection, { opacity: 1 });
        
        studioTimeline.to(studioSection, {
            backgroundColor: "#F8F8F8",
            duration: 0.5,
            ease: "none"
        }, 0);
        
        studioTimeline.to(studioSection, {
            backgroundColor: "#FFFFFF",
            duration: 0.5,
            ease: "none"
        }, 0.5);
    } else {
        // Auf Mobile auch sicherstellen dass Opacity 1 ist
        gsap.set(studioSection, { opacity: 1 });
    }
    
    // Text emerges from background - animate from initial state
    // PERFORMANCE: Auf Mobile nur opacity + y (kein scale) für bessere Performance
    const textAnimationProps = {
        opacity: 1,
        y: 0,
        duration: isMobile ? 0.2 : 0.3, // Kürzere Duration auf Mobile
        stagger: {
            each: isMobile ? 0.012 : 0.01, // Weniger Stagger auf Mobile = weniger gleichzeitige Animationen
            from: "start"
        },
        ease: isMobile ? "power1.out" : "power2.out", // Einfachere Easing auf Mobile
        force3D: true
    };
    
    // Scale und Blur nur auf Desktop
    if (!isMobile) {
        textAnimationProps.scale = 1;
        textAnimationProps.filter = "blur(0px)";
    }
    
    studioTimeline.to(words, textAnimationProps, 0);
}

// Expanding Box Section Animation - Line Drawing Effect
const expandingSection = cachedElements.expandingSection || document.getElementById('expandingSection');
const expandingBox = document.getElementById('expandingBox');
const expandingText = document.getElementById('expandingText');
const expandingContent = document.querySelector('.expanding-content');
const expandingGridItems = document.querySelectorAll('.expanding-grid-item');

if (expandingSection && expandingBox && expandingText && expandingContent) {
    // Detect mobile for performance
    const isMobile = isMobileTablet();
    const scrollDuration = isMobile ? "+=300%" : "+=500%";
    
    // Create timeline triggered after studio text animation
    const expandTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: cachedElements.studioSection || studioSection,
            start: "top top",
            end: scrollDuration,
            scrub: isMobile ? 1.2 : 0.5, // Besseres Scrub-Delay
            markers: false,
            onUpdate: (self) => {
                // Start after studio text is done (around 50% progress)
                if (self.progress > 0.5) {
                    gsap.set(expandingBox, { opacity: 1 });
                }
            }
        }
    });
    
    // Phase 1: Horizontal line expansion (0.5-0.7) - expand to full width
    expandTimeline.to(expandingBox, {
        width: "100vw",
        left: "0",
        x: 0, // Remove translateX centering
        duration: 0.2,
        ease: "power2.out"
    }, 0.5);
    
    // Phase 2: Vertical expansion to form square (0.7-0.9)
    expandTimeline.to(expandingBox, {
        height: "60vh",
        duration: 0.2,
        ease: "power2.inOut"
    }, 0.7);
    
    // Text opens like a window during square formation (0.75-0.95)
    expandTimeline.to(expandingText, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.2,
        ease: "power1.inOut"
    }, 0.75);
    
    // Phase 3: Expand to full viewport (0.9-1.0)
    expandTimeline.to(expandingBox, {
        width: "100vw",
        height: "100vh",
        bottom: "0vh",
        duration: 0.1,
        ease: "power2.inOut"
    }, 0.9);
    
    // Text stays centered - no position change
    
    // Grid items fade in after final expansion (0.95-1.0)
    expandTimeline.to(expandingContent, {
        opacity: 1,
        duration: 0.05,
        ease: "power2.inOut",
        onStart: () => {
            expandingContent.style.pointerEvents = "auto";
        }
    }, 0.95);
    
    expandTimeline.to(expandingGridItems, {
        opacity: 1,
        y: 0,
        duration: 0.05,
        stagger: 0.02,
        ease: "power2.out"
    }, 0.95);
}

// Expanding content and text scroll up when studio section is no longer 100% of viewport
const studioSectionForExpanding = cachedElements.studioSection || studioSection;
if (studioSectionForExpanding && expandingContent && expandingText) {
    // The studio section is pinned for 500% of viewport height (end: "+=500%")
    // After that, it unpins and is no longer 100% of viewport
    // Create a ScrollTrigger that starts after the pin duration to detect when studio section unpins
    
    // Detect mobile for performance
    const isMobile = isMobileTablet();
    const scrollDuration = isMobile ? "+=300%" : "+=500%";
    const extendedDuration = isMobile ? "+=360%" : "+=600%"; // Extend beyond pin duration
    
    // This ScrollTrigger starts when studio section would unpin (after pin duration)
    ScrollTrigger.create({
        trigger: studioSectionForExpanding,
        start: "top top",
        end: extendedDuration,
        scrub: isMobile ? 1.2 : 0.5, // Besseres Scrub-Delay
        markers: false,
        onUpdate: (self) => {
            // Calculate pin end progress based on scroll duration
            const pinEndProgress = isMobile ? 300 / 360 : 500 / 600; // ~0.833
            
            if (self.progress > pinEndProgress) {
                // Studio section is no longer 100% of viewport, start scrolling expanding-content up
                const scrollPastPin = (self.progress - pinEndProgress) / (1 - pinEndProgress); // 0 to 1
                
                // Move expanding-content up smoothly (expandingText stays centered)
                const moveUpAmount = scrollPastPin * window.innerHeight;
                
                gsap.set(expandingContent, {
                    y: -moveUpAmount,
                    force3D: true
                });
            } else {
                // Still pinned (100% of viewport), keep expanding-content at original position
                gsap.set(expandingContent, {
                    y: 0,
                    force3D: true
                });
            }
        },
        onEnter: () => {
            gsap.set(expandingContent, {
                willChange: "transform"
            });
        },
        onLeaveBack: () => {
            // Reset when scrolling back (studio section becomes 100% again)
            gsap.set(expandingContent, {
                y: 0,
                willChange: "auto"
            });
        }
    });
}


// Header und Card Toggle scrollen nach oben wenn expanding box expanded ist
const cardToggle = document.getElementById('cardToggle');
const footerSection = cachedElements.footerSection || document.getElementById('footerSection');
const headerElement = document.querySelector('.header');

if (expandingSection && headerElement && expandingBox) {
    // Detect mobile for performance
    const isMobile = isMobileTablet();
    const scrollDuration = isMobile ? "+=300%" : "+=500%";
    
    ScrollTrigger.create({
        trigger: cachedElements.studioSection || studioSection,
        start: "top top",
        end: scrollDuration,
        scrub: isMobile ? 1.2 : 0.5, // Besseres Scrub-Delay
        markers: false,
        onUpdate: (self) => {
            // Header scrollt nach oben wenn expanding box expanded ist (ab 0.9 progress)
            if (self.progress >= 0.9) {
                const expandProgress = (self.progress - 0.9) / 0.1; // 0 to 1 when expanding box is fully expanded
                const moveAmount = expandProgress * 400; // Max 400px upward
                gsap.set(headerElement, {
                    top: 40 - moveAmount,
                    force3D: true
                });
                
            } else {
                // Reset wenn noch nicht expanded
                gsap.set(headerElement, { top: 40 });
            }
        },
        onLeaveBack: () => {
            // Reset header position when scrolling back
            gsap.set(headerElement, { top: 40 });
        }
    });
}
// Blur expanding section and text when footer scrolls up (nur Desktop)
const footerSectionForBlur = cachedElements.footerSection || footerSection;
if (footerSectionForBlur && expandingSection && !isMobileDevice()) {
    gsap.to(expandingSection, {
        filter: "blur(8px)",
        scrollTrigger: {
            trigger: footerSectionForBlur,
            start: "top bottom",
            end: "top center",
            scrub: true
        }
    });
}


// Card Toggle wird vom Footer verdeckt
if (footerSectionForBlur && cardToggle) {
    ScrollTrigger.create({
        trigger: footerSectionForBlur,
        start: "top bottom",
        end: "top 200px",
        scrub: true,
        onUpdate: (self) => {
            // Card Toggle wird ausgeblendet wenn Footer näher kommt
            const opacity = 1 - self.progress;
            const y = self.progress * 100; // Bewegt sich nach unten
            gsap.set(cardToggle, {
                opacity: opacity,
                y: y,
                force3D: true
            });
        },
        onLeaveBack: () => {
            // Reset wenn Footer wieder weg ist
            gsap.set(cardToggle, {
                opacity: 1,
                y: 0
            });
        }
    });
}

// Overlapping Screens Animation
const overlappingScreensWrapper = document.getElementById('overlappingScreensWrapper');
if (overlappingScreensWrapper) {
    const screens = [1, 2, 3, 4, 5].map(i => document.getElementById(`screen${i}`)).filter(Boolean);
    if (screens.length === 5) {
        // Screen 1 should be visible initially
        gsap.set(screens[0], { yPercent: 0 });
        
        // Screens 2-5 start off-screen
        screens.slice(1).forEach(screen => {
            gsap.set(screen, { yPercent: 100 });
        });
        
        screens.forEach((screen, index) => {
            if (index === 0) return; // Skip screen 1, it's already visible
            
            const offset = index * 100;
            gsap.to(screen, {
                yPercent: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: overlappingScreensWrapper,
                    start: `top+=${offset - 30}vh bottom`,
                    end: `top+=${offset + 20}vh top`,
                    scrub: true
                }
            });
        });
    }
}

// Cookie Consent Management
const CookieManager = {
    get: (name) => typeof Cookies !== 'undefined' ? Cookies.get(name) : localStorage.getItem(name),
    set: (name, value) => typeof Cookies !== 'undefined' ? Cookies.set(name, value, { expires: 365, sameSite: 'strict' }) : localStorage.setItem(name, value),
    remove: (name) => typeof Cookies !== 'undefined' ? Cookies.remove(name) : localStorage.removeItem(name)
};

// Global function to check if cookies are accepted
function hasCookieConsent() {
    const consent = CookieManager.get('cookieConsent');
    return consent === 'accepted';
}

// Function to load tracking scripts only if consent is given
function loadTrackingScripts() {
    if (!hasCookieConsent()) return;
    // Tracking-Skripte können hier geladen werden
}

// Cookie Banner Functionality
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieDecline = document.getElementById('cookieDecline');
    
    if (!cookieBanner) return;
    
    // Prüfe, ob bereits eine Cookie-Einstellung gespeichert wurde
    const existingConsent = CookieManager.get('cookieConsent');
    
    if (existingConsent) {
        // Bereits eine Entscheidung getroffen - Banner nicht anzeigen
        cookieBanner.style.display = 'none';
        
        // Tracking-Skripte laden, wenn akzeptiert
        if (existingConsent === 'accepted') {
            loadTrackingScripts();
        }
        return;
    }
    
    // Set initial state - hidden below viewport
    gsap.set(cookieBanner, {
        y: '100%',
        opacity: 0,
        pointerEvents: 'none'
    });
    
    function hideCookieBanner() {
        // Stoppe alle laufenden Animationen
        gsap.killTweensOf(cookieBanner);
        
        // Animate slide-out to bottom
        gsap.to(cookieBanner, {
            y: '100%',
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => {
                cookieBanner.classList.remove('show');
                cookieBanner.style.display = 'none';
                cookieBanner.style.visibility = 'hidden';
            }
        });
    }
    
    // Cookie speichern Helper
    const saveCookie = (value) => {
        try {
            if (typeof Cookies !== 'undefined') {
                Cookies.set('cookieConsent', value, { expires: 365, sameSite: 'strict' });
            } else {
                CookieManager.set('cookieConsent', value);
            }
        } catch {
            localStorage.setItem('cookieConsent', value);
        }
    };
    
    // Event Handler
    const handleCookieClick = (value, loadTracking = false) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        saveCookie(value);
        hideCookieBanner();
        if (loadTracking) loadTrackingScripts();
        return false;
    };
    
    if (cookieAccept) cookieAccept.onclick = handleCookieClick('accepted', true);
    if (cookieDecline) cookieDecline.onclick = handleCookieClick('declined', false);
    
    // Show banner only if no consent has been given yet
    setTimeout(() => {
        // Zeige Banner an
        cookieBanner.style.display = 'flex';
        cookieBanner.classList.add('show');
        
        // Setze initial state für Animation
        gsap.set(cookieBanner, {
            y: '100%',
            opacity: 0,
            pointerEvents: 'none'
        });
        
        // Animate slide-in from bottom using GSAP
        gsap.to(cookieBanner, {
            y: 0,
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.8,
            ease: "power3.out",
            delay: 0.5,
            onComplete: () => {
                // Stelle sicher, dass Buttons klickbar sind nach der Animation
                if (cookieAccept) {
                    cookieAccept.style.pointerEvents = 'auto';
                    cookieAccept.style.cursor = 'pointer';
                }
                if (cookieDecline) {
                    cookieDecline.style.pointerEvents = 'auto';
                    cookieDecline.style.cursor = 'pointer';
                }
            }
        });
    }, 3000); // Show after 3 seconds
}

onDOMReady(initCookieBanner);


// Footer Logo Text Scale Animation - von 14vw auf 18vw beim Scrollen
const footerLogoText = document.querySelector('.footer-logo-text');

if (footerLogoText) {
    // Set initial state - Text ist bei 14vw (scale 1.0)
    gsap.set(footerLogoText, {
        scale: 1.0,
        transformOrigin: "center center",
        force3D: true,
        willChange: "transform"
    });
    
    // Animation beim Scrollen - Text wird größer von 14vw (scale 1.0) zu 18vw (scale 1.286)
    // 18vw / 14vw = 1.286
    ScrollTrigger.create({
        trigger: footerLogoText,
        start: "top bottom",
        end: "bottom top",
        scrub: 3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            // Scale von 1.0 zu 1.286 basierend auf scroll progress
            const progress = self.progress;
            const scale = 1.0 + (progress * 0.286); // 1.0 bis 1.286
            
            // Skaliere Text mit transform
            gsap.set(footerLogoText, {
                scale: scale,
                force3D: true
            });
        },
        onEnterBack: () => {
            // Reset wenn zurück gescrollt wird
            gsap.set(footerLogoText, {
                scale: 1.0
            });
        }
    });
}

// ========================== 
// TEAM PAGE JAVASCRIPT
// ========================== 

// Team member data
const teamData = {
    david: {
        role: 'Frontend-Development',
        description: 'Mein Hintergrund liegt im Fashion Design. Ich liebe Ästhetik und habe eine Fashion Brand gegründet. Dann bin ich zum Webdesign und <strong>Frontend-Development</strong> gewechselt. <strong>MINIMALISMUS</strong> und <strong>FORMEN</strong> sind meine Leidenschaft.',
        quote: '"Mein Ziel ist es etwas zu kreieren was in Menschen Emotionen auslöst"',
        image: 'WhatsApp Image 2025-10-27 at 11.39.05.jpeg'
    },
    leon: {
        role: 'Backend-Development',
        description: 'Mein Fokus liegt auf robusten und skalierbaren Backend-Lösungen. Ich entwickle Systeme, die nicht nur funktionieren, sondern auch wachsen können. <strong>ARCHITEKTUR</strong> und <strong>PERFORMANCE</strong> sind meine Stärken.',
        quote: '"Ich baue die unsichtbaren Fundamente, die großartige Erfahrungen ermöglichen"',
        image: 'Bildschirmfoto 2025-11-12 um 15.30.31.png'
    }
};

// Initialize team page (only on team.html)
function initTeamPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Check if we're on team page by looking for team elements
    if (!document.querySelector('.team-title-section')) return;
    if (!currentPage.includes('team')) return;
    
    // Lazy load animations with Intersection Observer for better performance
    const teamTitleSection = document.querySelector('.team-title-section');
    if (!teamTitleSection) return;
    
    // Animate line from left to right - only when section is visible
    const teamTitleLine = document.querySelector('.team-title-line');
    if (teamTitleLine && typeof gsap !== 'undefined') {
        // Use Intersection Observer to start animation when section enters viewport
        const lineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.set(teamTitleLine, {
                        width: 0,
                        transformOrigin: "left center"
                    });
                    gsap.to(teamTitleLine, {
                        width: "calc(100% - 4vw)",
                        duration: 3,
                        ease: "power2.out"
                    });
                    // Stop observing after animation starts
                    lineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        lineObserver.observe(teamTitleSection);
    }
    
    const teamNames = document.querySelectorAll('.team-name');
    const teamDescription = document.getElementById('teamDescription');
    const teamQuote = document.getElementById('teamQuote');
    const teamRole = document.querySelector('.team-role');
    const teamImage = document.querySelector('.team-image');
    const teamBottomGrid = document.querySelector('.team-bottom-grid');
    const teamContentWrapper = document.querySelector('.team-content-wrapper');
    
    // Animate quote to move up to top of grid when container reaches top:50px
    // Only on desktop (not mobile)
    const isMobile = isMobileDevice();
    if (!isMobile && typeof ScrollTrigger !== 'undefined' && teamQuote && teamBottomGrid && teamContentWrapper) {
        let scrollTriggerInstance = null;
        
        // Calculate the distance the quote needs to move
        function setupQuoteAnimation() {
            // Kill existing ScrollTrigger if it exists
            if (scrollTriggerInstance) {
                scrollTriggerInstance.kill();
            }
            
            // Reset quote position
            gsap.set(teamQuote, { y: 0 });
            
            // Wait for layout to settle
            setTimeout(() => {
                const gridRect = teamBottomGrid.getBoundingClientRect();
                const quoteRect = teamQuote.getBoundingClientRect();
                
                const distanceToMove = quoteRect.top - gridRect.top;
                
                // Get the main container to use as trigger
                const teamMainContainer = document.querySelector('.team-main-container');
                if (!teamMainContainer) return;
                
                // Create ScrollTrigger animation
                // Start when content wrapper reaches top:50px (its sticky position)
                // The wrapper is sticky with top: 50px, so we trigger when it reaches that position
                scrollTriggerInstance = ScrollTrigger.create({
                    trigger: teamContentWrapper,
                    start: "top 50px", // When wrapper reaches top: 50px (its sticky position)
                    end: () => `+=${Math.abs(distanceToMove)}`, // Scroll distance equals quote movement distance
                    scrub: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        // Move quote up by the calculated distance
                        const translateY = -progress * distanceToMove;
                        gsap.set(teamQuote, { y: translateY });
                    }
                });
            }, 50);
        }
        
        // Setup after initial render
        setTimeout(setupQuoteAnimation, 200);
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                setupQuoteAnimation();
            } else if (scrollTriggerInstance) {
                scrollTriggerInstance.kill();
            }
        });
    }
    
    // Set initial state (David)
    updateTeamMember('david');
    
    // Team Switch functionality
    const teamSwitch = document.getElementById('teamSwitch');
    let currentMember = 'david';
    
    const updateSwitch = (member) => {
        if (teamSwitch) {
            teamSwitch.classList.toggle('active', member === 'david');
        }
    };
    
    if (teamSwitch) {
        teamSwitch.classList.add('active');
        teamSwitch.addEventListener('click', () => {
            currentMember = currentMember === 'david' ? 'leon' : 'david';
            updateTeamMember(currentMember, false);
            updateSwitch(currentMember);
        });
    }
    
    teamNames.forEach(nameElement => {
        nameElement.addEventListener('click', function() {
            currentMember = this.getAttribute('data-member');
            updateTeamMember(currentMember, false);
            updateSwitch(currentMember);
        });
    });
    
    // Update only content (for hover) without changing name styles
    function updateTeamMemberContent(member) {
        const data = teamData[member];
        
        // Update role
        if (teamRole) {
            teamRole.textContent = data.role;
        }
        
        // Update description
        if (teamDescription) {
            teamDescription.innerHTML = `<p>${data.description}</p>`;
        }
        
        // Update quote
        if (teamQuote) {
            teamQuote.innerHTML = `<p>${data.quote}</p>`;
        }
        
        // Update image
        if (teamImage) {
            teamImage.src = data.image;
        }
        
        const teamContact = document.getElementById('teamContact');
        if (teamContact) teamContact.href = member === 'david' ? 'mailto:david@dev-design.studio' : 'mailto:leon@dev-design.de';
    }
    
    function updateTeamMember(member, isHover = false) {
        teamNames.forEach(name => {
            const memberName = name.getAttribute('data-member');
            const primaryName = name.querySelector('.team-name-primary');
            const secondaryName = name.querySelector('.team-name-secondary');
            const isActive = memberName === member;
            
            if (!isHover) {
                name.classList.toggle('team-name-active', isActive);
            }
            if (primaryName) primaryName.style.display = isActive ? 'block' : 'none';
            if (secondaryName) secondaryName.style.display = isActive ? 'none' : 'block';
        });
        updateTeamMemberContent(member);
    }
    
    // Infinity Bar animation - CSS on mobile, JS scroll on desktop only
    const infinityContent = document.querySelector('.info-infinity-content');
    
    if (!infinityContent) return;
    
    // Ensure content is duplicated for seamless loop
    const textElements = infinityContent.querySelectorAll('.info-text');
    if (textElements.length < 16) {
        const originalContent = infinityContent.innerHTML;
        infinityContent.innerHTML = originalContent + originalContent;
    }
    
    // On mobile: use CSS animation only (no JS)
    if (isMobileDevice()) {
        infinityContent.classList.add('mobile-infinity-animation');
        return;
    }
    
    // Desktop: use scroll-triggered animation
    const infoSection = document.getElementById('infoSection');
    if (!infoSection || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    // Calculate content width once
    const firstText = infinityContent.querySelector('.info-text');
    if (!firstText) return;
    
    const textWidth = firstText.offsetWidth;
    const gap = 60;
    const itemsPerSet = 8;
    const contentWidth = (textWidth + gap) * itemsPerSet;
    
    // Create scroll-triggered animation (desktop only)
    ScrollTrigger.create({
        trigger: infoSection,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
            const currentX = -self.progress * contentWidth;
            gsap.set(infinityContent, { x: currentX % contentWidth });
        }
    });
    
    // Custom cursor and click event for infinity bar (desktop only)
    if (!isMobileDevice() && customCursor) {
        // Add hover effect to entire infinity content area
        infinityContent.addEventListener('mouseenter', () => {
            customCursor.classList.add('infinity-bar-cursor');
        });
        
        infinityContent.addEventListener('mouseleave', () => {
            customCursor.classList.remove('infinity-bar-cursor');
        });
        
        // Add click event to entire infinity content area
        infinityContent.addEventListener('click', () => {
            // Open questionnaire (same as cardToggle) - trigger cardToggle click
            const cardToggle = document.getElementById('cardToggle');
            if (cardToggle) {
                cardToggle.click();
            }
        });
    }
}

onDOMReady(initTeamPage);

// Online Kalender - Verbindung Item Click Handler
function initOnlineKalender() {
    const verbindungItems = document.querySelectorAll('.verbindung-item h3');
    
    if (verbindungItems.length === 0) return; // Nur auf onlinekalender.html ausführen
    
    verbindungItems.forEach(function(h3) {
        h3.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.closest('.verbindung-item-content');
            const isActive = content.classList.contains('active');
            
            // Schließe alle anderen
            document.querySelectorAll('.verbindung-item-content').forEach(function(item) {
                if (item !== content) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle aktuelles Item
            if (isActive) {
                content.classList.remove('active');
            } else {
                content.classList.add('active');
            }
        });
    });
    
    // Schließe beim Klick außerhalb
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.verbindung-item')) {
            document.querySelectorAll('.verbindung-item-content').forEach(function(item) {
                item.classList.remove('active');
            });
        }
    });
}

onDOMReady(initOnlineKalender);

// Mandantenservice Features Animation
function initMandantenserviceFeatures() {
    document.querySelectorAll('.feature-number').forEach(num => {
        gsap.to(num, {
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: num.closest('.mandantenservice-feature-item'),
                start: "top 80%"
            }
        });
    });
}

onDOMReady(initMandantenserviceFeatures);

// Beurkundungen Section Animation
function initBeurkundungenAnimation() {
    document.querySelectorAll('.beurkundung-number').forEach(num => {
        gsap.to(num, {
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: num.closest('.beurkundung-step'),
                start: "top 80%"
            }
        });
    });
}

onDOMReady(initBeurkundungenAnimation);

// Navigation Overlays für ARBEITEN und SERVICES
function initNavigationOverlays() {
    const arbeitenLink = document.getElementById('kundenLink');
    const servicesLink = document.getElementById('servicesLink');
    const arbeitenOverlay = document.getElementById('arbeitenOverlay');
    const servicesOverlay = document.getElementById('servicesOverlay');
    
    if (!arbeitenLink || !servicesLink || !arbeitenOverlay || !servicesOverlay) return;
    
    let arbeitenTimeout, arbeitenAnimationTimeout;
    let servicesTimeout, servicesAnimationTimeout;
    let currentOverlay = null;
    
    // Funktion zum Schließen eines Overlays
    function closeOverlay(overlay) {
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            currentOverlay = null;
        }
        // Body-Klasse entfernen, wenn kein Overlay mehr aktiv ist
        if (!arbeitenOverlay.classList.contains('active') && !servicesOverlay.classList.contains('active')) {
            document.body.classList.remove('overlay-active');
            
            // GSAP-Kontrolle entfernen, damit CSS die Transition übernimmt
            const navigationContainer = cachedElements.navigationContainer || document.querySelector('.navigation-container');
            if (navigationContainer && typeof gsap !== 'undefined') {
                gsap.set(navigationContainer, { clearProps: 'y' });
            }
        }
    }
    
    // Funktion zum Öffnen eines Overlays
    function openOverlay(overlay) {
        // Schließe das andere Overlay, falls offen
        if (currentOverlay && currentOverlay !== overlay) {
            closeOverlay(currentOverlay);
        }
        
        if (overlay && !overlay.classList.contains('active')) {
            overlay.classList.add('active');
            currentOverlay = overlay;
            // Body-Klasse hinzufügen, um Content nach unten zu verschieben
            document.body.classList.add('overlay-active');
            
            // GSAP-Kontrolle entfernen, damit CSS die Transition übernimmt
            const navigationContainer = cachedElements.navigationContainer || document.querySelector('.navigation-container');
            if (navigationContainer && typeof gsap !== 'undefined') {
                gsap.set(navigationContainer, { clearProps: 'y' });
            }
        }
    }
    
    // ARBEITEN Hover Events
    arbeitenLink.addEventListener('mouseenter', () => {
        clearTimeout(arbeitenTimeout);
        clearTimeout(arbeitenAnimationTimeout);
        arbeitenAnimationTimeout = setTimeout(() => {
            openOverlay(arbeitenOverlay);
        }, 300);
    });
    
    arbeitenLink.addEventListener('mouseleave', () => {
        clearTimeout(arbeitenAnimationTimeout);
        arbeitenTimeout = setTimeout(() => {
            closeOverlay(arbeitenOverlay);
        }, 200);
    });
    
    // SERVICES Hover Events
    servicesLink.addEventListener('mouseenter', () => {
        clearTimeout(servicesTimeout);
        clearTimeout(servicesAnimationTimeout);
        servicesAnimationTimeout = setTimeout(() => {
            openOverlay(servicesOverlay);
        }, 300);
    });
    
    servicesLink.addEventListener('mouseleave', () => {
        clearTimeout(servicesAnimationTimeout);
        servicesTimeout = setTimeout(() => {
            closeOverlay(servicesOverlay);
        }, 200);
    });
    
    // Overlay Hover Events - damit das Overlay offen bleibt, wenn man darüber hovert
    arbeitenOverlay.addEventListener('mouseenter', () => {
        clearTimeout(arbeitenTimeout);
    });
    
    arbeitenOverlay.addEventListener('mouseleave', () => {
        arbeitenTimeout = setTimeout(() => {
            closeOverlay(arbeitenOverlay);
        }, 200);
    });
    
    servicesOverlay.addEventListener('mouseenter', () => {
        clearTimeout(servicesTimeout);
    });
    
    servicesOverlay.addEventListener('mouseleave', () => {
        servicesTimeout = setTimeout(() => {
            closeOverlay(servicesOverlay);
        }, 200);
    });
    
    // Schließe Overlays beim Klick außerhalb
    document.addEventListener('click', (e) => {
        if (!arbeitenLink.contains(e.target) && !servicesLink.contains(e.target) &&
            !arbeitenOverlay.contains(e.target) && !servicesOverlay.contains(e.target)) {
            closeOverlay(arbeitenOverlay);
            closeOverlay(servicesOverlay);
        }
    });
}

onDOMReady(initNavigationOverlays);
