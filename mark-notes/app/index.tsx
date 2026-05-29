import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

interface Note {
  id: string;
  title: string;
  body: string;
}

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "demo-1",
      title: "Sample Code Note",
      body: "Welcome to this minimal notes app.\n\nYou can write standard markdown:\n- **Bold text** here\n- Inline code like `const x = 10;`\n\nOr write a code block:\n```js\nconsole.log(\"Hello world!\");\n```",
    },
  ]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleAddNote = () => {
    if (body.trim() === "") return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
    };
    setNotes([newNote, ...notes]);
    setTitle("");
    setBody("");
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.appTitle}>Notes</Text>

        {/* Input Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#7c7c8c"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TextInput
            style={styles.bodyInput}
            placeholder="Write markdown or code snippets..."
            placeholderTextColor="#7c7c8c"
            multiline
            value={body}
            onChangeText={setBody}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNote}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        {/* Notes List */}
        <View style={styles.notesList}>
          {notes.map((note) => (
            <View key={note.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {note.title.trim().length > 0 && (
                  <Text style={styles.cardTitle}>{note.title}</Text>
                )}
                <TouchableOpacity
                  onPress={() => handleDeleteNote(note.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <MinimalMarkdown content={note.body} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ----------------------------------------------------
// Ultra-Minimalist Markdown & Code Segment Parser
// ----------------------------------------------------
function MinimalMarkdown({ content }: { content: string }) {
  const parts = content.split("```");

  return (
    <View style={styles.markdownContainer}>
      {parts.map((part, index) => {
        const isCodeBlock = index % 2 === 1;

        if (isCodeBlock) {
          // Extract compiler language tag if present (first word)
          const lines = part.split("\n");
          let codeText = part;
          if (
            lines.length > 0 &&
            lines[0].trim().length < 10 &&
            !lines[0].includes(" ") &&
            lines[0].trim() !== ""
          ) {
            codeText = lines.slice(1).join("\n");
          }
          return (
            <View key={index} style={styles.codeContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{codeText.trim()}</Text>
              </ScrollView>
            </View>
          );
        } else {
          // Parse lines for normal text, headers, and bullet lists
          const lines = part.split("\n");
          return lines.map((line, lineIdx) => {
            if (line.trim() === "") {
              return <View key={`${index}-${lineIdx}`} style={styles.spacer} />;
            }

            // Bullet lists
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <View key={`${index}-${lineIdx}`} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.text}>{renderInline(line.substring(2))}</Text>
                </View>
              );
            }

            // Heading 1
            if (line.startsWith("# ")) {
              return (
                <Text key={`${index}-${lineIdx}`} style={styles.h1}>
                  {renderInline(line.substring(2))}
                </Text>
              );
            }

            // Heading 2
            if (line.startsWith("## ")) {
              return (
                <Text key={`${index}-${lineIdx}`} style={styles.h2}>
                  {renderInline(line.substring(3))}
                </Text>
              );
            }

            // Default Paragraph
            return (
              <Text key={`${index}-${lineIdx}`} style={styles.text}>
                {renderInline(line)}
              </Text>
            );
          });
        }
      })}
    </View>
  );
}

// Sub-parser for bold (**) and inline code (`)
// Returns styled elements only for formatted pieces, and raw text for standard segments.
function renderInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={index} style={styles.boldText}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <Text key={index} style={styles.inlineCodeText}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return part; // Return standard string directly (preserves natural layout and alignment)
  });
}

// ----------------------------------------------------
// B&W Minimal Stylesheet
// ----------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 24,
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  form: {
    marginBottom: 36,
  },
  titleInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  bodyInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 12,
    fontSize: 14,
    color: "#000000",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlignVertical: "top",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#000000",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  notesList: {
    gap: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#000000",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e2e8",
    paddingBottom: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    flex: 1,
    paddingRight: 12,
  },
  deleteButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#000000",
  },
  deleteButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000000",
  },
  // Markdown renderer styles
  markdownContainer: {
    marginVertical: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    color: "#000000",
    marginBottom: 6,
  },
  boldText: {
    fontWeight: "800",
  },
  inlineCodeText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#f2f2f5",
    color: "#000000",
    fontSize: 12.5,
    paddingHorizontal: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  h1: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 6,
    color: "#000000",
  },
  h2: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 4,
    color: "#000000",
  },
  spacer: {
    height: 8,
  },
  // Monospace code block
  codeContainer: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#000000",
    padding: 10,
    marginVertical: 10,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12.5,
    color: "#000000",
  },
});
