/**
 * SwiperSniffer Module
 * Monitors for swiper elements in Elementor and applies queued changes when they are initialized.
 */
const SwiperSniffer = (function () {
    // Debug flag for logging
    const DEBUG_LOG = true;

    // Object to store swiper instances keyed by their data-id
    let swiperInstances = {};
    let pendingSwiperInstances = {};

    // Queue to store pending operations on swiper instances
    let pendingOperations = {};

    /**
     * Custom log function that checks the debug flag before logging
     * @param {...any} args - Arguments to log
     */
    function debugLog(...args) {
        if (DEBUG_LOG) {
            console.log("SwiperSniffer:", ...args);
        }
    }

    /**
     * Checks if an element is a swiper element
     * @param {HTMLElement} element - DOM element to check
     * @returns {boolean} True if element is a swiper element
     */
    function isSwiperElement(element) {
        return element.classList.contains("swiper");
    }

    /**
     * Checks if a swiper element is initialized
     * @param {HTMLElement} element - Swiper DOM element to check
     * @returns {boolean} True if swiper element is initialized
     */
    function isSwiperInitialized(element) {
        return element.classList.contains("swiper-initialized");
    }

    /**
     * Applies pending operations to a swiper instance
     * @param {string} dataId - Data ID of the swiper instance
     */
    function applyPendingOperations(dataId) {
        debugLog("Applying pending operations for swiper instance:", dataId);
        if (pendingOperations[dataId]) {
            pendingOperations[dataId].forEach(function (operation) {
                operation(swiperInstances[dataId]);
            });
            delete pendingOperations[dataId];
        }
    }

    /**
     * Handles DOM mutations, looking for swiper elements and initializing them
     * @param {MutationRecord[]} mutations - Array of mutation records
     */
    function handleMutations(mutations) {
        debugLog("Handling DOM mutations");
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === 1 && isSwiperElement(node)) {
                    var containerElement = node.closest(".elementor-element");
                    var dataId = containerElement.getAttribute("data-id");
                    if (dataId) {
                        debugLog("Found swiper element with data-id:", dataId);
                        pendingSwiperInstances[dataId] = node;

                        var observer = new MutationObserver(function (mutations, obs) {
                            if (isSwiperInitialized(node)) {
                                debugLog("Swiper instance initialized:", dataId);
                                swiperInstances[dataId] = node;
                                applyPendingOperations(dataId);
                                obs.disconnect();
                            }
                        });
                        observer.observe(node, { attributes: true, attributeFilter: ["class"] });
                    }
                }
            });
        });
    }

    /**
     * Registers changes to a swiper instance
     * @param {string} dataId - Data ID of the swiper instance
     * @param {Function} operation - Function to apply to the swiper instance
     */
    function registerSwiperChange(dataId, operation) {
        debugLog("Registering change for swiper instance:", dataId);
        if (swiperInstances[dataId]) {
            operation(swiperInstances[dataId]);
        } else {
            if (!pendingOperations[dataId]) {
                pendingOperations[dataId] = [];
            }
            pendingOperations[dataId].push(operation);
        }
    }

    // Initialize the module when the DOM is fully loaded
    document.addEventListener("DOMContentLoaded", function () {
        var observer = new MutationObserver(handleMutations);
        observer.observe(document.body, { childList: true, subtree: true });
        debugLog("SwiperSniffer initialized and observing DOM changes");
    });

    // Public API
    return {
        registerSwiperChange: registerSwiperChange,
    };
})();

// Usage example:
// SwiperSniffer.registerSwiperChange('dataIdValue', function(swiperInstance) {
//     // Make changes to the swiperInstance
// });
