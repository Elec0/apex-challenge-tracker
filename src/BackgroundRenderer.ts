import $ from "cash-dom";

/**
 * Load today's background
 * 
 * Use this powershell command to list all images, because we can't read them from the server (I think?)
 * ```ps
 * Write-Host "let availableImages = [" (ls | ForEach-Object { "`"$($_.Name)`","}) "];"
 * ```
 */
export function setupBackground() {
    let availableImages = [ "apex-background.jpg", "kings-canyon-1.png", "kings-canyon-2.png", "kings-canyon-4.png", "kings-canyon-9.png", "worlds-edge-1.png", "worlds-edge-3.png", "worlds-edge-4.png", "worlds-edge-5.png", "worlds-edge-6.png", ];
    let todayImageIndex = (new Date()).getDay() % availableImages.length;
    const backgrCSS = `background: url("res/images/backgrounds/${availableImages[todayImageIndex]}") center center fixed;`
    // set body background to backgrCSS
    console.debug(`Setting background to '${availableImages[todayImageIndex]}'`);
    // Set the body element style directly, instead of the CSS because /shrug
    document.body.style.cssText = backgrCSS;
}