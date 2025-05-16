<?php
// Function to calculate hash of all HTML files
function calculateContentHash() {
    $hash = '';
    $baseDir = __DIR__;
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($baseDir));
    
    foreach ($iterator as $file) {
        if ($file->isFile() && 
            (pathinfo($file->getPathname(), PATHINFO_EXTENSION) === 'html' ||
             pathinfo($file->getPathname(), PATHINFO_EXTENSION) === 'js' ||
             pathinfo($file->getPathname(), PATHINFO_EXTENSION) === 'css')) {
            $hash .= md5_file($file->getPathname());
        }
    }
    
    return md5($hash);
}

// Read current version file
$versionFile = __DIR__ . '/version.json';
$currentVersion = json_decode(file_get_contents($versionFile), true);

// Calculate new content hash
$newHash = calculateContentHash();

// Update version if content has changed
if (!isset($currentVersion['contentHash']) || $currentVersion['contentHash'] !== $newHash) {
    // Increment version number
    $version = isset($currentVersion['version']) ? $currentVersion['version'] : '1.0.0';
    $parts = explode('.', $version);
    $parts[2] = intval($parts[2]) + 1;
    $newVersion = implode('.', $parts);
    
    // Save new version info
    $versionData = [
        'version' => $newVersion,
        'contentHash' => $newHash,
        'lastUpdated' => date('c')
    ];
    
    file_put_contents($versionFile, json_encode($versionData, JSON_PRETTY_PRINT));
    echo "Version updated to " . $newVersion . "\n";
} else {
    echo "No changes detected, version remains " . $currentVersion['version'] . "\n";
}
?>
