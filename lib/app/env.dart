import 'package:flutter_dotenv/flutter_dotenv.dart';

enum AppFlavor { dev, prod }

class EnvConfig {
  EnvConfig({required this.flavor});
  final AppFlavor flavor;
}

class Env {
  static late final String supabaseUrl;
  static late final String supabaseAnonKey;

  static Future<void> load(AppFlavor flavor) async {
    await dotenv.load(
      fileName: flavor == AppFlavor.dev ? 'assets/.env.dev' : 'assets/.env',
    );

    supabaseUrl = dotenv.env['SUPABASE_URL']!;
    supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY']!;
  }
}
