import 'package:citizen_app/core/network/dio_client.dart';
import 'package:citizen_app/features/home/data/profile_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dioProvider = Provider((_) => DioClient.build());
final profileRepositoryProvider =
    Provider((ref) => ProfileRepository(ref.read(dioProvider)));
