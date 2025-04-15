<?php
include 'config.php'; // Include your DB config

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';

    $stmt = $pdo->prepare("INSERT INTO Talents (name, category) VALUES (:name, :category)");
    $stmt->execute(['name' => $name, 'category' => $category]);

    echo "Talent added successfully!";
}
?>
