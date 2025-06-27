/// Modelo para representar un mensaje de chat.
/// 
/// Corresponde con el MessageDto del backend.
class ChatMessage {
  final int id;
  final String content;
  final String authorName;
  final String authorLastName;
  final bool pinned;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorLastName,
    this.pinned = false,
    required this.createdAt,
  });

  /// Obtiene el nombre completo del autor
  String get fullName => '$authorName $authorLastName';

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as int,
      content: json['content'] as String,
      authorName: json['authorName'] as String,
      authorLastName: json['authorLastName'] as String,
      pinned: json['pinned'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'authorName': authorName,
      'authorLastName': authorLastName,
      'pinned': pinned,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  ChatMessage copyWith({
    int? id,
    String? content,
    String? authorName,
    String? authorLastName,
    bool? pinned,
    DateTime? createdAt,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      content: content ?? this.content,
      authorName: authorName ?? this.authorName,
      authorLastName: authorLastName ?? this.authorLastName,
      pinned: pinned ?? this.pinned,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ChatMessage && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'ChatMessage(id: $id, content: $content, author: $fullName, pinned: $pinned, createdAt: $createdAt)';
  }
}
