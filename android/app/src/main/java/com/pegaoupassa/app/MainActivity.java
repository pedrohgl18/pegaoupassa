package com.pegaoupassa.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Canal para mensagens
            NotificationChannel messagesChannel = new NotificationChannel(
                "messages",
                "Mensagens",
                NotificationManager.IMPORTANCE_HIGH
            );
            messagesChannel.setDescription("Notificações de novas mensagens");
            messagesChannel.enableVibration(true);
            messagesChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            messagesChannel.setShowBadge(true);

            // Canal para matches
            NotificationChannel matchesChannel = new NotificationChannel(
                "matches",
                "Matches",
                NotificationManager.IMPORTANCE_HIGH
            );
            matchesChannel.setDescription("Notificações de novos matches");
            matchesChannel.enableVibration(true);
            matchesChannel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            matchesChannel.setShowBadge(true);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(messagesChannel);
            notificationManager.createNotificationChannel(matchesChannel);
        }
    }
}