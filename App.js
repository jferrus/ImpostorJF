import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  initDatabase,
  addPlayer,
  getPlayers,
  clearPlayers,
  setupGame,
  getGameState,
  updateGamePhase,
  resetGame,
  deletePlayer
} from './src/db/database';

export default function App() {
  const [phase, setPhase] = useState('setup'); // setup, intermediate, reveal, end
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isImpostorRevealed, setIsImpostorRevealed] = useState(false);

  useEffect(() => {
    initDatabase();
    refreshPlayers();
  }, []);

  const refreshPlayers = () => {
    const p = getPlayers();
    setPlayers(p);
  };

  const handleAddPlayer = () => {
    if (playerName.trim().length === 0) return;
    addPlayer(playerName.trim());
    setPlayerName('');
    refreshPlayers();
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      Alert.alert('Error', 'Necesitas al menos 3 jugadores para jugar.');
      return;
    }
    try {
      await setupGame();
      const state = getGameState();
      setGameState(state);
      setPhase('intermediate');
      setCurrentPlayerIndex(0);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleShowReveal = () => {
    setPhase('reveal');
  };

  const handleNextPlayer = () => {
    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex < players.length) {
      setCurrentPlayerIndex(nextIndex);
      updateGamePhase('intermediate', nextIndex);
      setPhase('intermediate');
    } else {
      setPhase('end');
      updateGamePhase('end');
    }
  };

  const handleReset = () => {
    setCurrentPlayerIndex(0);
    setPhase('intermediate');
    setIsImpostorRevealed(false);
    updateGamePhase('intermediate', 0);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar Jugadores',
      '¿Estás seguro de que quieres borrar todos los jugadores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar', style: 'destructive', onPress: () => {
            clearPlayers();
            refreshPlayers();
          }
        },
      ]
    );
  };

  const handleDeletePlayer = (id) => {
    deletePlayer(id);
    refreshPlayers();
  };

  // Render Helpers
  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.title}>ImpostorJF</Text>
          <Text style={styles.subtitle}>Configurar jugadores (Mínimo 3)</Text>
        </View>

        <FlatList
          data={players}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.playerTag}
              onPress={() => handleDeletePlayer(item.id)}
            >
              <Text style={styles.playerText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay jugadores todavía.</Text>}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del jugador..."
            placeholderTextColor="#888"
            value={playerName}
            onChangeText={setPlayerName}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.mainButton, players.length < 3 && styles.disabledButton]} onPress={handleStartGame}>
            <Text style={styles.mainButtonText}>EMPEZAR JUEGO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClearAll}>
            <Text style={styles.secondaryButtonText}>Limpiar Lista</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'intermediate') {
    const currentPlayer = players[currentPlayerIndex];
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.instructionLarge}>Pasa el móvil a:</Text>
        <View style={styles.nameHighlight}>
          <Text style={styles.playerRevealName}>{currentPlayer.name}</Text>
        </View>
        <TouchableOpacity style={styles.mainButton} onPress={handleShowReveal}>
          <Text style={styles.mainButtonText}>ESTOY LISTO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'reveal') {
    const currentPlayer = players[currentPlayerIndex];
    const isImpostor = gameState.impostor_id === currentPlayer.id;
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.revealCard}>
          <Text style={styles.categoryLabel}>Categoría</Text>
          <Text style={styles.categoryValue}>{gameState.category.replace('Categoría: ', '')}</Text>

          <View style={styles.divider} />

          <Text style={styles.instruction}>
            {isImpostor ? 'Tu pista es:' : 'Tu palabra es:'}
          </Text>
          <Text style={styles.wordDisplay}>
            {isImpostor ? gameState.clue : gameState.word}
          </Text>

          {!isImpostor && (
            <>
              <View style={styles.dividerSmall} />
              <Text style={styles.clueLabel}>Pista adicional:</Text>
              <Text style={styles.clueValue}>{gameState.clue}</Text>
            </>
          )}

          {isImpostor && (
            <View style={styles.impostorLabelContainer}>
              <MaterialCommunityIcons name="incognito" size={24} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.impostorHint}>Eres el Impostor</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.mainButton} onPress={handleNextPlayer}>
          <Text style={styles.mainButtonText}>ENTENDIDO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'end') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>¡Ronda Terminada!</Text>
        <Text style={styles.instruction}>Debaten quién es el impostor...</Text>

        {isImpostorRevealed ? (
          <View style={styles.revealBox}>
            <MaterialCommunityIcons name="incognito" size={60} color="#EF4444" style={{ marginBottom: 10 }} />
            <Text style={styles.revealTitle}>El impostor era:</Text>
            <Text style={styles.impostorName}>{gameState?.impostor_name}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.revealImpostorButton} onPress={() => setIsImpostorRevealed(true)}>
            <Text style={styles.mainButtonText}>REVELAR IMPOSTOR</Text>
          </TouchableOpacity>
        )}

        {!isImpostorRevealed && (
          <TouchableOpacity style={styles.mainButton} onPress={handleReset}>
            <Text style={styles.mainButtonText}>NUEVA RONDA</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={() => {
          setIsImpostorRevealed(false);
          setGameState(null);
          setPhase('setup');
          resetGame();
        }}>
          <Text style={styles.secondaryButtonText}>FINALIZAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  playerTag: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 6,
  },
  playerText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 40,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#F1F5F9',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 28,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  mainButton: {
    backgroundColor: '#38BDF8',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    padding: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionLarge: {
    fontSize: 24,
    color: '#94A3B8',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 20,
    color: '#94A3B8',
    marginBottom: 10,
  },
  nameHighlight: {
    backgroundColor: '#1E293B',
    padding: 30,
    borderRadius: 24,
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  playerRevealName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
  },
  wordDisplay: {
    fontSize: 64,
    fontWeight: '900',
    color: '#38BDF8',
    textAlign: 'center',
    marginVertical: 20,
  },
  impostorHint: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
  },
  impostorLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  revealBox: {
    backgroundColor: '#1E293B',
    padding: 30,
    borderRadius: 24,
    marginVertical: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  revealTitle: {
    fontSize: 20,
    color: '#94A3B8',
  },
  impostorName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#EF4444',
    marginTop: 10,
  },
  revealImpostorButton: {
    backgroundColor: '#EF4444',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  revealCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#38BDF8',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    width: '100%',
    marginBottom: 20,
  },
  dividerSmall: {
    height: 1,
    backgroundColor: '#334155',
    width: '60%',
    marginVertical: 15,
  },
  clueLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  clueValue: {
    fontSize: 16,
    color: '#F1F5F9',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
