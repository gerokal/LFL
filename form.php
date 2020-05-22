<?php
    if (isset($_POST['submit'])){
        $name = $_POST['name'];
        $subject = $_POST['position'];
        $mailFrom = $_POST['email'];
        $phone = $_POST['phone'];
        $message = $_POST['message'];

        $mailTo = "lfl@barnesandroehamptonbandb.com";
        $headers = "Player e-mail: ".$mailFrom.".\nPhone: ".$phone;
        $txt = "Player name: ".$name.".\nMessage: ".$message;

        mail($mailTo, $subject, $txt, $headers);
        header("Location: mailsent.php");
    }
    
?>