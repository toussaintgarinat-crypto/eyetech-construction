package com.percemur.wrapper;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;

import java.util.Random;

public class LiDARInterface {
    Context mContext;
    private static final String TAG = "LiDARInterface";
    private boolean isLiDARConnected = false;
    private boolean isScanning = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Random random = new Random();

    LiDARInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void connectLiDAR() {
        Log.d(TAG, "connectLiDAR called from WebView");
        if (!isLiDARConnected) {
            showToast("Tentative de connexion au LiDAR...");
            // Simulate a delay for connection
            handler.postDelayed(() -> {
                isLiDARConnected = true;
                // Notify WebView about status change
                ((MainActivity) mContext).webView.post(() -> {
                    ((MainActivity) mContext).webView.evaluateJavascript("window.onLiDARStatusChange(\"connected\");", null);
                });
                showToast("LiDAR connecté.");
            }, 2000); // Simulate 2 seconds connection time
        } else {
            showToast("LiDAR déjà connecté.");
            ((MainActivity) mContext).webView.post(() -> {
                ((MainActivity) mContext).webView.evaluateJavascript("window.onLiDARStatusChange(\"connected\");", null);
            });
        }
    }

    @JavascriptInterface
    public void disconnectLiDAR() {
        Log.d(TAG, "disconnectLiDAR called from WebView");
        if (isLiDARConnected) {
            if (isScanning) {
                stopScan(); // Stop scan if active
            }
            isLiDARConnected = false;
            showToast("LiDAR déconnecté.");
            ((MainActivity) mContext).webView.post(() -> {
                ((MainActivity) mContext).webView.evaluateJavascript("window.onLiDARStatusChange(\"disconnected\");", null);
            });
        } else {
            showToast("LiDAR n'est pas connecté.");
        }
    }

    @JavascriptInterface
    public void startScan() {
        Log.d(TAG, "startScan called from WebView");
        if (isLiDARConnected && !isScanning) {
            isScanning = true;
            showToast("Démarrage du scan LiDAR.");
            ((MainActivity) mContext).webView.post(() -> {
                ((MainActivity) mContext).webView.evaluateJavascript("window.onLiDARStatusChange(\"scanning\");", null);
            });
            // Simulate continuous data reception
            handler.post(sendLiDARDataRunnable);
        } else if (!isLiDARConnected) {
            showToast("Veuillez connecter le LiDAR d'abord.");
        } else {
            showToast("Le scan est déjà en cours.");
        }
    }

    @JavascriptInterface
    public void stopScan() {
        Log.d(TAG, "stopScan called from WebView");
        if (isScanning) {
            isScanning = false;
            handler.removeCallbacks(sendLiDARDataRunnable);
            showToast("Arrêt du scan LiDAR.");
            ((MainActivity) mContext).webView.post(() -> {
                ((MainActivity) mContext).webView.evaluateJavascript("window.onLiDARStatusChange(\"connected\");", null);
            });
        } else {
            showToast("Aucun scan n'est en cours.");
        }
    }

    @JavascriptInterface
    public String getLiDARStatus() {
        Log.d(TAG, "getLiDARStatus called from WebView");
        if (isScanning) {
            return "scanning";
        } else if (isLiDARConnected) {
            return "connected";
        } else {
            return "disconnected";
        }
    }

    // Runnable to simulate sending LiDAR data
    private Runnable sendLiDARDataRunnable = new Runnable() {
        @Override
        public void run() {
            if (isScanning) {
                // Simulate a point cloud data (e.g., 100 points)
                StringBuilder dataBuilder = new StringBuilder();
                dataBuilder.append("[");
                for (int i = 0; i < 100; i++) {
                    double x = random.nextDouble() * 10 - 5; // -5 to 5 meters
                    double y = random.nextDouble() * 10 - 5;
                    double z = random.nextDouble() * 5; // 0 to 5 meters
                    dataBuilder.append(String.format("[%.2f,%.2f,%.2f]%s", x, y, z, (i < 99 ? "," : "")));
                }
                dataBuilder.append("]");
                String simulatedData = dataBuilder.toString();

                ((MainActivity) mContext).webView.post(() -> {
                    ((MainActivity) mContext).webView.evaluateJavascript("window.onLiDARDataReceived(" + simulatedData + ");", null);
                });
                handler.postDelayed(this, 100); // Send data every 100ms
            }
        }
    };
}

