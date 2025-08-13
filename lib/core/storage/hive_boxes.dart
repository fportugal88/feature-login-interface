import 'package:hive_flutter/hive_flutter.dart';

class HiveBoxes {
  static Future<void> init() async {
    await Hive.initFlutter();
    // Registrar adapters se tiver modelos HiveType
  }
}
