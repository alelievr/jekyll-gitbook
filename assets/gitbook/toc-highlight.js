function initTOCHighlight() {
    // Get all headers in the content area
    const headers = document.querySelectorAll('#book-search-results h2, #book-search-results h3, #book-search-results h4');
    const tocLinks = document.querySelectorAll('.chapter a');
    let lastActiveLink = null;

    // Debug log to check headers and links
    console.log('Headers:', Array.from(headers).map(h => h.textContent.trim()));
    console.log('TOC links:', Array.from(tocLinks).map(l => l.textContent.trim()));

    // Create a map of header text to TOC links that handles nested headers
    const headerToLinkMap = new Map();
    headers.forEach(header => {
        const headerText = header.textContent.trim();
        
        // Find matching TOC link by comparing text content
        const matchingLink = Array.from(tocLinks).find(link => {
            const linkText = link.textContent.trim();
            return headerText === linkText;
        });

        if (matchingLink) {
            console.log('Mapped:', headerText, 'to:', matchingLink.textContent.trim());
            headerToLinkMap.set(header, matchingLink);
        } else {
            console.log('No match found for header:', headerText);
        }
    });

    // Function to expand a chapter in the TOC
    function expandParentChapters(listItem) {
        let current = listItem;
        while (current && !current.classList.contains('book-summary')) {
            // If this is a list item containing a ul (has sub-items)
            if (current.tagName === 'LI' && current.querySelector('ul')) {
                current.classList.add('expanded');
            }
            current = current.parentElement;
        }
    }

    // Find the currently visible header
    function findVisibleHeader() {
        const headerOffset = 150;
        let currentHeader = null;
        let minDistance = Infinity;

        const bookBody = document.querySelector('.book-body');
        const scrollTop = bookBody ? bookBody.scrollTop : 0;

        headers.forEach(header => {
            const rect = header.getBoundingClientRect();
            
            // Check if header is below the fixed header but still in the top portion of viewport
            if (rect.top >= 0 && rect.top <= headerOffset) {
                const distance = rect.top;
                if (distance < minDistance) {
                    minDistance = distance;
                    currentHeader = header;
                }
            }
        });

        // If no header is in the ideal zone, find the last header that's above
        if (!currentHeader) {
            let lastAboveHeader = null;
            let lastAboveDistance = -Infinity;

            headers.forEach(header => {
                const rect = header.getBoundingClientRect();
                if (rect.top <= headerOffset && rect.top > lastAboveDistance) {
                    lastAboveDistance = rect.top;
                    lastAboveHeader = header;
                }
            });

            currentHeader = lastAboveHeader;
        }

        return currentHeader;
    }

    // Update TOC highlighting
    function updateTOCHighlight() {
        const visibleHeader = findVisibleHeader();
        
        // Remove previous highlighting from all items
        document.querySelectorAll('.chapter li').forEach(item => {
            item.classList.remove('active');
        });

        if (visibleHeader) {
            const matchingLink = headerToLinkMap.get(visibleHeader);
            
            if (matchingLink) {
                // Find the li parent that represents the TOC item
                const listItem = matchingLink.closest('li');
                if (listItem) {
                    // Add active class to the li element
                    listItem.classList.add('active');
                    
                    // Expand parent chapters
                    expandParentChapters(listItem);
                }
            }
        }
    }

    // Optimized debounce function
    function debounce(func, wait) {
        let timeout;
        let lastRun = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastRun >= wait) {
                func.apply(this, args);
                lastRun = now;
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(this, args);
                    lastRun = Date.now();
                }, wait);
            }
        };
    }

    // Add scroll event listener to the book-body
    const bookBody = document.querySelector('.book-body');
    if (bookBody) {
        const scrollHandler = debounce(updateTOCHighlight, 20);
        bookBody.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // Handle window resize
    window.addEventListener('resize', debounce(updateTOCHighlight, 100), { passive: true });

    // Initial highlight
    setTimeout(updateTOCHighlight, 100);
}

// Initialize when the page is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTOCHighlight);
} else {
    initTOCHighlight();
}

// Also initialize after GitBook's page change
var gitbook = window.gitbook || [];
gitbook.push(function() {
    initTOCHighlight();
}); 