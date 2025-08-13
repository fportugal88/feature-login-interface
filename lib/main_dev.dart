import 'package:citizen_app/app/bootstrap.dart';
import 'package:citizen_app/app/env.dart';

Future<void> main() async {
  await bootstrap(EnvConfig(flavor: AppFlavor.dev));
}
