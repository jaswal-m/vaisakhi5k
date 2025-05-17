<?php
// Get current timestamp
$currentDate = date('Y-m-d');

// Read current version file
$versionFile = 'version.json';
$versionData = json_decode(file_get_contents($versionFile), true);

// Increment version number
$version = $versionData['version'];
$vParts = explode('.', $version);
$vParts[2] = intval($vParts[2]) + 1;
$newVersion = implode('.', $vParts);

// Update version data
$newVersionData = [
    'version' => $newVersion,
    'lastUpdated' => $currentDate
];

// Write new version data
file_put_contents($versionFile, json_encode($newVersionData, JSON_PRETTY_PRINT));

echo "Version updated to " . $newVersion . "\n";
?>
