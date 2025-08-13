import 'dart:async';

import 'package:citizen_app/app/app.dart';
import 'package:citizen_app/app/env.dart';
import 'package:citizen_app/core/storage/hive_boxes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> bootstrap(EnvConfig config) async {
  WidgetsFlutterBinding.ensureInitialized();

  await Env.load(config.flavor);

  await HiveBoxes.init();

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runZonedGuarded(() {
    runApp(const ProviderScope(child: App()));
  }, (error, stack) {
    debugPrint('Uncaught: $error');
  });
}
