import 'package:hive/hive.dart';

part 'photo_entry.g.dart';

@HiveType(typeId: 0)
class PhotoEntry extends HiveObject{
  @HiveField(0)
  late String filePath;
  @HiveField(1)
  late DateTime timestamp;
  @HiveField(2)
  late double latitude;
  @HiveField(3)
  late double longitude;
}