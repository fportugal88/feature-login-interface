# citizen_app

Aplicativo Flutter com login via Supabase seguindo Material Design 3.

## Execução

### Desenvolvimento
```bash
flutter pub get
flutter run -t lib/main_dev.dart
```

### Produção
```bash
flutter run -t lib/main_prod.dart
```

### Testes
```bash
flutter analyze
dart run build_runner build --delete-conflicting-outputs
flutter test
```
