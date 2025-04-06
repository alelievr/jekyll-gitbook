// Enable footnote link support for pages with width < 1240.
//
function bind_footnote_links() {
    if ($(document).width() > 1240) {
        return;
    }
    let footnotes = $("div.footnotes").find("ol > li > p > a.reversefootnote");
    for (let i = 0; i < footnotes.length; i++) {
        let footnote = footnotes[i];
        footnote.addEventListener('click', function(e) {
            e.preventDefault();
            var target = $($(this).attr('href'));
            if (target.length) {
                $('div.body-inner').animate({
                    scrollTop: target.get(0).offsetTop,
                });
            }
        });
    }
}

// Handle header title visibility based on scroll position
function handleHeaderTitleVisibility() {
    const headerTitle = document.getElementById('book-header-title');
    if (headerTitle) {
        // Try different scrollable elements
        const scrollTop = 
            document.querySelector('.body-inner')?.scrollTop || 
            document.querySelector('.book-body')?.scrollTop || 
            document.querySelector('.book')?.scrollTop || 
            document.documentElement.scrollTop || 
            document.body.scrollTop;

        if (scrollTop > 100) {
            headerTitle.style.opacity = '1';
        } else {
            headerTitle.style.opacity = '0';
        }
    }
}

// Initialize scroll handling
function initScrollHandling() {
    // Try different scrollable elements
    const scrollableElements = [
        document.querySelector('.body-inner'),
        document.querySelector('.book-body'),
        document.querySelector('.book'),
        window
    ];

    scrollableElements.forEach(element => {
        if (element) {
            element.addEventListener('scroll', handleHeaderTitleVisibility);
        }
    });

    // Check initial position
    handleHeaderTitleVisibility();
}

// Initialize everything after GitBook is ready
var gitbook = gitbook || [];
gitbook.push(function() {
    // Initialize on first load
    bind_footnote_links();
    initScrollHandling();
    
    // Store original hasChanged function
    const originalHasChanged = gitbook.page.hasChanged;
    
    // Override hasChanged to also initialize our scroll handling
    gitbook.page.hasChanged = function() {
        // Call original function
        originalHasChanged.apply(this, arguments);
        // Initialize our scroll handling
        initScrollHandling();
    };
});

