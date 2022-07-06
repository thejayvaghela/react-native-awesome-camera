var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, View, FlatList, Text, Image, } from "react-native";
import { Camera, useCameraDevices, } from "react-native-vision-camera";
import CameraRoll from "@react-native-community/cameraroll";
import { getCameraPermission, getStorageOrLibraryPermission, } from "./Permissions";
const AwesomeCamera = () => {
    var _a;
    const { container, photoButton, bottomOuter, videoStyle, imageStyle, selectedImageStyleOuter, selectedImageStyle, bottomInner, count, } = styles;
    const [video, setVideo] = useState(false);
    const [photos, setPhotos] = useState();
    const [selectedImage, setSelectedImage] = useState([]);
    // eslint-disable-next-line no-spaced-func
    const [media, setMedia] = useState([]);
    const devices = useCameraDevices();
    const camera = useRef(null);
    let device = devices.back;
    useEffect(() => {
        managePermissions();
        getPhotosDetails();
    }, []);
    const getPhotosDetails = () => __awaiter(void 0, void 0, void 0, function* () {
        const items = yield CameraRoll.getPhotos({
            first: 20,
            assetType: "Photos",
        });
        setPhotos(items);
    });
    const managePermissions = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield getCameraPermission();
            yield getStorageOrLibraryPermission();
            const microphonePermission = yield Camera.getMicrophonePermissionStatus();
            if (microphonePermission === "denied") {
                yield Camera.requestMicrophonePermission();
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    const getMorePhotos = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (photos === null || photos === void 0 ? void 0 : photos.page_info.has_next_page) {
                const items = yield CameraRoll.getPhotos({
                    first: 20,
                    assetType: "Photos",
                    after: photos === null || photos === void 0 ? void 0 : photos.page_info.end_cursor,
                });
                setPhotos({
                    edges: [...photos === null || photos === void 0 ? void 0 : photos.edges, ...items.edges],
                    page_info: items.page_info,
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    const takePicture = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (camera.current) {
                const snapshot = yield (camera === null || camera === void 0 ? void 0 : camera.current.takeSnapshot({
                    quality: 85,
                    skipMetadata: true,
                }));
                snapshot.path = `file:///${snapshot.path}`;
                setMedia([...media, snapshot]);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    const startRecording = () => {
        try {
            setVideo(true);
            if (camera.current) {
                camera.current.startRecording({
                    flash: "off",
                    onRecordingFinished: (v) => {
                        setMedia([...media, v]);
                    },
                    onRecordingError: (error) => console.error(error),
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    const stopRecording = () => __awaiter(void 0, void 0, void 0, function* () {
        setVideo(false);
        if (camera.current) {
            yield camera.current.stopRecording();
        }
    });
    if (device == null) {
        return <ActivityIndicator />;
    }
    return (<SafeAreaView style={container}>
      <Camera ref={camera} onError={(error) => console.log(error)} style={StyleSheet.absoluteFill} device={device} isActive={true} video={true} audio={true} enableZoomGesture={true} preset={"low"}/>
      <View style={bottomOuter}>
        <FlatList showsHorizontalScrollIndicator={false} data={photos === null || photos === void 0 ? void 0 : photos.edges} horizontal={true} renderItem={({ item }) => {
            const index = selectedImage.findIndex((data) => data.node.image.uri === item.node.image.uri);
            return (<Pressable onPress={() => {
                    if (index >= 0) {
                        selectedImage.splice(index, 1);
                        setSelectedImage([...selectedImage]);
                    }
                    else {
                        setSelectedImage([...selectedImage, item]);
                    }
                }}>
                <Image source={{ uri: item.node.image.uri }} style={[
                    imageStyle,
                    {
                        borderWidth: (index >= 0 && 1) || 0,
                    },
                ]}/>
              </Pressable>);
        }} keyExtractor={(item) => item.node.image.uri} onEndReached={getMorePhotos}/>
        <View style={bottomInner}>
          <Text style={count}>{media.length + selectedImage.length}</Text>
          <Pressable onPress={takePicture} style={photoButton} onLongPress={startRecording} onPressIn={() => {
            console.log("in");
        }} onPressOut={stopRecording}>
            <View style={(video && videoStyle) || {}}/>
          </Pressable>
          <View style={selectedImageStyleOuter}>
            {(media.length && (<Image onError={(e) => {
                console.log(e);
            }} source={{
                uri: `${(_a = media[(media === null || media === void 0 ? void 0 : media.length) - 1]) === null || _a === void 0 ? void 0 : _a.path}`,
            }} style={selectedImageStyle}/>)) ||
            null}
          </View>
        </View>
      </View>
    </SafeAreaView>);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    photoButton: {
        height: 80,
        width: 80,
        marginTop: 10,
        borderWidth: 3,
        borderColor: "#fff",
        borderRadius: 40,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
    },
    videoStyle: {
        backgroundColor: "red",
        height: 60,
        width: 60,
        alignSelf: "center",
        borderRadius: 30,
    },
    bottomOuter: {
        position: "absolute",
        bottom: 30,
    },
    imageStyle: {
        height: 100,
        width: 100,
        margin: 10,
        borderColor: "yellow",
    },
    count: {
        color: "#fff",
        flex: 1,
        textAlign: "center",
    },
    bottomInner: {
        flex: 3,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    selectedImageStyle: {
        width: 80,
        height: 80,
    },
    selectedImageStyleOuter: {
        flex: 1,
        alignItems: "center",
    },
});
export default AwesomeCamera;
//# sourceMappingURL=AwesomeCamera.js.map