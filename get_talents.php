<?php
include 'config.php'; // Include your DB config
$stmt = $pdo->query("SELECT * FROM Talents");
$talents = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($talents);
?>
