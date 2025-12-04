/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

class ImageCacheManager {
    private cache: Map<string, HTMLImageElement> = new Map();
    private MAX_CONCURRENT_PRELOADS = 3; // Limit concurrent loads to avoid network/memory overload

    /**
     * Preloads a single image and stores it in the cache.
     * @param url The data URL or external URL of the image to preload.
     * @returns A promise that resolves when the image is loaded.
     */
    preload(url: string): Promise<void> {
        if (!url || this.cache.has(url)) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(url, img);
                resolve();
            };
            img.onerror = (e) => {
                console.warn(`Failed to preload image: ${url}`, e);
                reject(e);
            };
            img.src = url;
        });
    }

    /**
     * Preloads a batch of images, limiting concurrent requests.
     * @param urls An array of image URLs to preload.
     * @returns A promise that resolves when all images in the batch are attempted to be preloaded.
     */
    async preloadBatch(urls: string[]): Promise<void> {
        const uniqueUrls = Array.from(new Set(urls)).filter(url => url && !this.cache.has(url));
        if (uniqueUrls.length === 0) return;

        const results = [];
        const activePromises = new Set<Promise<void>>();

        for (const url of uniqueUrls) {
            const promise = this.preload(url);
            results.push(promise);
            activePromises.add(promise);

            promise.finally(() => activePromises.delete(promise));

            if (activePromises.size >= this.MAX_CONCURRENT_PRELOADS) {
                // Wait for at least one active promise to settle before adding more
                await Promise.race(Array.from(activePromises));
            }
        }
        await Promise.allSettled(results); // Wait for all preloads in the batch to complete (or fail)
    }

    /**
     * Retrieves a preloaded image from the cache.
     * @param url The URL of the image to retrieve.
     * @returns The HTMLImageElement if found, otherwise undefined.
     */
    get(url: string): HTMLImageElement | undefined {
        return this.cache.get(url);
    }

    /**
     * Clears the entire image cache.
     */
    clear(): void {
        this.cache.clear();
        console.log("Image cache cleared.");
    }
}

export const ImageCache = new ImageCacheManager();
