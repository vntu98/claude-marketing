# Platform-Specific Configuration

## iOS (ios/)

### Info.plist Permissions
```xml
<!-- Camera -->
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture photos for your posts.</string>

<!-- Photo Library -->
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo access to attach images to your posts.</string>

<!-- Push Notifications -->
<key>UIBackgroundModes</key>
<array><string>remote-notification</string></array>
```

### App Store Submission Checklist
- [ ] App icon: 1024x1024px (no alpha)
- [ ] Screenshots: 6.5" (1284x2778), 5.5" (1242x2208)
- [ ] Privacy policy URL
- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Age rating questionnaire
- [ ] Sign in with Apple (if other social logins exist)

## Android (android/)

### AndroidManifest.xml Permissions
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Play Store Submission Checklist
- [ ] App icon: 512x512px
- [ ] Feature graphic: 1024x500px
- [ ] Screenshots: min 2, max 8 per device type
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Target API level (latest stable)

## Firebase Cloud Messaging (Push Notifications)

### Setup
```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^latest
  firebase_messaging: ^latest
```

### Initialize
```dart
// main.dart
await Firebase.initializeApp();

final fcmToken = await FirebaseMessaging.instance.getToken();
// Send fcmToken to your backend

FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  // Handle foreground message
  showLocalNotification(message);
});

FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  // Handle notification tap (app in background)
  navigateToScreen(message.data);
});
```

## Deep Linking

### GoRouter Setup
```dart
final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/posts/:id', builder: (_, state) {
      final id = state.pathParameters['id']!;
      return PostDetailScreen(postId: id);
    }),
  ],
);
```

### Android App Links
```xml
<!-- AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="yourapp.com" />
</intent-filter>
```

### iOS Universal Links
```json
// apple-app-site-association (hosted at yourapp.com/.well-known/)
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAMID.com.yourcompany.yourapp",
      "paths": ["/posts/*", "/invite/*"]
    }]
  }
}
```
