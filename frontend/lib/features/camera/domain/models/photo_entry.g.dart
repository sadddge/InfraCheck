// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'photo_entry.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class PhotoEntryAdapter extends TypeAdapter<PhotoEntry> {
  @override
  final int typeId = 0;

  @override
  PhotoEntry read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return PhotoEntry()
      ..filePath = fields[0] as String
      ..timestamp = fields[1] as DateTime
      ..latitude = fields[2] as double
      ..longitude = fields[3] as double;
  }

  @override
  void write(BinaryWriter writer, PhotoEntry obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.filePath)
      ..writeByte(1)
      ..write(obj.timestamp)
      ..writeByte(2)
      ..write(obj.latitude)
      ..writeByte(3)
      ..write(obj.longitude);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PhotoEntryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
