import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../domain/models/photo_model.dart';

class PhotoDatabaseService {
  static Database? _database;
  static const String tableName = 'photos';

  // Singleton pattern
  static final PhotoDatabaseService _instance = PhotoDatabaseService._internal();
  factory PhotoDatabaseService() => _instance;
  PhotoDatabaseService._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'photos.db');
    
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createTable,
    );
  }

  Future<void> _createTable(Database db, int version) async {
    await db.execute('''
      CREATE TABLE $tableName (
        id TEXT PRIMARY KEY,
        filePath TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        fileSize INTEGER NOT NULL
      )
    ''');

    // Crear índice para consultas más rápidas por fecha
    await db.execute('''
      CREATE INDEX idx_created_at ON $tableName (createdAt)
    ''');
  }

  /// Guardar una nueva foto en la base de datos
  Future<void> savePhoto(PhotoModel photo) async {
    final db = await database;
    await db.insert(
      tableName,
      photo.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Obtener todas las fotos (ordenadas por fecha, más recientes primero)
  Future<List<PhotoModel>> getAllPhotos() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return PhotoModel.fromMap(maps[i]);
    });
  }

  /// Obtener fotos que aún no han expirado (menos de 7 días)
  Future<List<PhotoModel>> getValidPhotos() async {
    final db = await database;
    final sevenDaysAgo = DateTime.now()
        .subtract(const Duration(days: 7))
        .millisecondsSinceEpoch;

    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'createdAt > ?',
      whereArgs: [sevenDaysAgo],
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return PhotoModel.fromMap(maps[i]);
    });
  }

  /// Obtener fotos expiradas (más de 7 días)
  Future<List<PhotoModel>> getExpiredPhotos() async {
    final db = await database;
    final sevenDaysAgo = DateTime.now()
        .subtract(const Duration(days: 7))
        .millisecondsSinceEpoch;

    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'createdAt <= ?',
      whereArgs: [sevenDaysAgo],
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return PhotoModel.fromMap(maps[i]);
    });
  }

  /// Obtener una foto por ID
  Future<PhotoModel?> getPhotoById(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      tableName,
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isNotEmpty) {
      return PhotoModel.fromMap(maps.first);
    }
    return null;
  }

  /// Eliminar una foto por ID
  Future<void> deletePhoto(String id) async {
    final db = await database;
    await db.delete(
      tableName,
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Eliminar múltiples fotos por IDs
  Future<void> deletePhotos(List<String> ids) async {
    final db = await database;
    final batch = db.batch();
    
    for (String id in ids) {
      batch.delete(
        tableName,
        where: 'id = ?',
        whereArgs: [id],
      );
    }
    
    await batch.commit();
  }

  /// Limpiar fotos expiradas
  Future<int> deleteExpiredPhotos() async {
    final db = await database;
    final sevenDaysAgo = DateTime.now()
        .subtract(const Duration(days: 7))
        .millisecondsSinceEpoch;

    return await db.delete(
      tableName,
      where: 'createdAt <= ?',
      whereArgs: [sevenDaysAgo],
    );
  }

  /// Obtener el conteo total de fotos
  Future<int> getPhotoCount() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) FROM $tableName');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  /// Obtener el tamaño total de todas las fotos en bytes
  Future<int> getTotalPhotosSize() async {
    final db = await database;
    final result = await db.rawQuery('SELECT SUM(fileSize) FROM $tableName');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  /// Cerrar la base de datos
  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
  }

  /// Eliminar toda la base de datos (para testing o reset completo)
  Future<void> deleteDatabase() async {
    String path = join(await getDatabasesPath(), 'photos.db');
    await databaseFactory.deleteDatabase(path);
    _database = null;
  }
}
