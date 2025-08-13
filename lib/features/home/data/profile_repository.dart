import 'package:dio/dio.dart';

class ProfileRepository {
  ProfileRepository(this._dio);

  final Dio _dio;

  Future<String> fetchProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/profile');
    return response.data.toString();
  }
}
