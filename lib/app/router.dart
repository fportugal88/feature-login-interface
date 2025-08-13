import 'package:citizen_app/features/auth/presentation/login_page.dart';
import 'package:citizen_app/features/auth/presentation/splash_page.dart';
import 'package:citizen_app/features/home/presentation/home_page.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashPage()),
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/', builder: (_, __) => const HomePage()),
    ],
    redirect: (context, state) {
      // TODO(user): check session Supabase and redirect
      return null;
    },
  );
});
