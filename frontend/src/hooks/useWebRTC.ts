import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

interface UseWebRTCOptions {
    roomId: string;
    onPeerJoined?: (userId: string) => void;
    onSessionEnded?: () => void;
}

export const useWebRTC = ({ roomId, onPeerJoined, onSessionEnded }: UseWebRTCOptions) => {
    const { socket, isConnected } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const configuration: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ],
    };

    // ── Initialize Local Media ────────────────────────────────────────────────
    const startLocalStream = useCallback(async (withVideo = true, withAudio = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: withVideo,
                audio: withAudio,
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            return null;
        }
    }, []);

    // ── Peer Connection Logic ─────────────────────────────────────────────────
    const createPeerConnection = useCallback((stream: MediaStream) => {
        if (peerConnection.current) return peerConnection.current;

        const pc = new RTCPeerConnection(configuration);

        // Add tracks from local stream
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        // Handle remote tracks
        pc.ontrack = (event) => {
            console.log('Got remote track:', event.streams[0]);
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                // Find all peers in the room (in simple 1:1, we just broadcast or target)
                // For simplicity in room logic, we rely on the targetSocketId provided by the signaling
                // But during initial setup, we need a way to reach the other person.
            }
        };

        peerConnection.current = pc;
        return pc;
    }, [socket]);

    // ── Signaling Listeners ──────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.emit('interview:join_room', { roomId });

        socket.on('interview:peer_joined', async ({ socketId }) => {
            console.log('Peer joined:', socketId);
            onPeerJoined?.(socketId);

            // If I am already in, initiate the offer
            if (localStream) {
                const pc = createPeerConnection(localStream);
                
                // Add ICE candidate handler with target knowledge
                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit('interview:ice_candidate', { targetSocketId: socketId, candidate: e.candidate });
                    }
                };

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('interview:offer', { targetSocketId: socketId, offer });
            }
        });

        socket.on('interview:offer', async ({ senderSocketId, offer }) => {
            console.log('Received offer from:', senderSocketId);
            if (!localStream) return;

            const pc = createPeerConnection(localStream);
            
            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit('interview:ice_candidate', { targetSocketId: senderSocketId, candidate: e.candidate });
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('interview:answer', { targetSocketId: senderSocketId, answer });
        });

        socket.on('interview:answer', async ({ answer }) => {
            console.log('Received answer');
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('interview:ice_candidate', async ({ candidate }) => {
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('interview:session_ended', () => {
            onSessionEnded?.();
        });

        return () => {
            socket.off('interview:peer_joined');
            socket.off('interview:offer');
            socket.off('interview:answer');
            socket.off('interview:ice_candidate');
            socket.off('interview:session_ended');
        };
    }, [socket, isConnected, roomId, localStream, createPeerConnection, onPeerJoined, onSessionEnded]);

    // ── Controls ──────────────────────────────────────────────────────────────
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
        }
    }, [localStream]);

    const shareScreen = useCallback(async () => {
        try {
            if (isSharingScreen) {
                // Stop sharing, revert to camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                replaceStreamTracks(stream);
                setIsSharingScreen(false);
            } else {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                replaceStreamTracks(screenStream);
                setIsSharingScreen(true);
                
                screenStream.getVideoTracks()[0].onended = () => {
                    setIsSharingScreen(false);
                    startLocalStream(); // Revert back when user clicks "Stop Sharing" in browser UI
                };
            }
        } catch (err) {
            console.error('Error sharing screen:', err);
        }
    }, [isSharingScreen, startLocalStream]);

    const replaceStreamTracks = (newStream: MediaStream) => {
        if (peerConnection.current) {
            const senders = peerConnection.current.getSenders();
            const videoTrack = newStream.getVideoTracks()[0];
            const sender = senders.find(s => s.track?.kind === 'video');
            if (sender && videoTrack) {
                sender.replaceTrack(videoTrack);
            }
        }
        setLocalStream(newStream);
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
        }
    };

    const endCall = useCallback(() => {
        if (socket) {
            socket.emit('interview:end_session', { roomId });
        }
        cleanup();
    }, [socket, roomId]);

    const cleanup = () => {
        localStream?.getTracks().forEach(track => track.stop());
        peerConnection.current?.close();
        peerConnection.current = null;
        setLocalStream(null);
        setRemoteStream(null);
    };

    return {
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        startLocalStream,
        toggleAudio,
        toggleVideo,
        shareScreen,
        isSharingScreen,
        endCall
    };
};
