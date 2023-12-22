const SwiperSniffer = (function () {
    const DEBUG_LOG = true;
    let swiperInstances = {};
    let pendingSwiperInstances = {};
    let pendingOperations = {};
    function debugLog(...args) {
        if (DEBUG_LOG) {
            console.log("SwiperSniffer:", ...args);
        }
    }
    function isSwiperElement(element) {
        return element.classList.contains("swiper");
    }
    function isSwiperInitialized(element) {
        return element.classList.contains("swiper-initialized");
    }
    function applyPendingOperations(dataId) {
        debugLog("Applying pending operations for swiper instance:", dataId);
        if (pendingOperations[dataId]) {
            pendingOperations[dataId].forEach(function (operation) {
                operation(swiperInstances[dataId]);
            });
            delete pendingOperations[dataId];
        }
    }
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
                                swiperInstances[dataId] = node.swiper;
                                applyPendingOperations(dataId);
                                obs.disconnect();
                            }
                        });
                        observer.observe(node, {
                            attributes: true,
                            attributeFilter: ["class"],
                        });
                    }
                }
            });
        });
    }
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
    document.addEventListener("DOMContentLoaded", function () {
        var observer = new MutationObserver(handleMutations);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        debugLog("SwiperSniffer initialized and observing DOM changes");
    });
    return { registerSwiperChange: registerSwiperChange };
})();
