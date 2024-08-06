import { Progress } from "@radix-ui/themes";
import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Upload = () => {
	const [files, setFiles] = useState({});
    const [file, setFile] = useState("");
    const [dragging, setDragging] = useState(false);
    const [fileSource, setFileSource] = useState(null);
    const [finish, setFinish] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mp3Url, setMp3Url] = useState("");
    const navigate = useNavigate();

    const uploadFile = () => {
        document.getElementById("file-input").click();
    };

    const fileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setUploaded(true);
            setFile(file.name);
            setFileSource(file);
        }
    };

    const hoverFile = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const leaveFile = (event) => {
        event.preventDefault();
        setDragging(false);
    };

    const dropFiles = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            setUploaded(true);
            setFile(file.name);
            setFileSource(file);
        }
    };

    const startGenerating = async () => {
		setLoading(true);
        console.log(loading)
        const formData = new FormData();
        formData.append("file", fileSource);
        console.log("file", file);
        console.log("fileSource", fileSource);

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/separate",
                formData,
                {
                    responseType: "arraybuffer",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (response.status === 200) {
				setLoading(false);
                const zip = new JSZip();
                const content = await zip.loadAsync(response.data);
                console.log(content);
				const files = {};
                for (const filename of Object.keys(content.files)) {
                    let url;
                    const fileData = await content.files[filename].async("blob");
                    if (filename.endsWith(".wav")) {
                        url = URL.createObjectURL(new Blob([fileData], { type: "audio/mp3" }));
                    } else if (filename.endsWith(".pdf")) {
                        url = URL.createObjectURL(new Blob([fileData], { type: "application/pdf" }));
                    } else {
                        url = URL.createObjectURL(new Blob([fileData], { type: "application/json" }));
                    }

                    files[filename] = url;
                }
                console.log(files)
                // Object.keys(content.files).forEach(async (filename) => {
                //     const fileData = await content.files[filename].async(
                //         "blob"
                //     );
                //     const url = URL.createObjectURL(
                //         new Blob([fileData], { type: "audio/mp3" })
                //     );
                    // if (filename === "vocals.wav") {
                    //     setMp3Url(url);
                    // }
                    // console.log(url);
                //});
				setFiles(files);
                setFinish(true);
                setLoading(false);
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const showResults = async () => {
		navigate('/result', { state: { files } });

        // try {
        // 	const response = await axios.get('http://127.0.0.1:5000/get-audio', {
        // 		responseType: 'blob',
        // 	});
        // 	if (response.status === 200) {
        // 		const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));
        // 		setMp3Url(url);
        // 		setFinish(true);
        // 	} else {
        // 		console.error('Failed to fetch results');
        // 	}
        // } catch (error) {
        // 	console.error('Error:', error);
        // }
    };

    const textAnimation = {
        hidden: { opacity: 0, y: -50 },
        show: {
            opacity: 0.9,
            y: 0,
            transition: {
                duration: 1,
                ease: "easeOut",
            },
        },
    };
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                delay: 0.5,
                duration: 1,
                ease: "easeOut",
            },
        },
    };

    // useEffect(() => {
    //     // fake for now
    //     if (loading) {
    //         console.log("loading");

    //         // setTimeout(() => {
    //         //     setFinish(true);
    //         // }, 5000);
    //     }
    // }, [loading]);

    return (
        <div className="max-w-xxLarge flex flex-col m-1 justify-center items-center">
            <motion.h1
                className="font-inter opacity-75 text-large font-medium mb-2 "
                variants={textAnimation}
                initial="hidden"
                animate="show"
            >
                Convert Your Favourite Song
            </motion.h1>
            {!loading && !finish && (
                <motion.div
                    className="p-2 rounded-lg m-5 border-white border border-opacity-100"
                    variants={container}
                    initial="hidden"
                    animate="show"
                    onDragOver={hoverFile}
                    onDragLeave={leaveFile}
                    onDrop={dropFiles}
                    style={{
                        backgroundColor: dragging
                            ? "rgba(255, 255, 255, 0.6)"
                            : "rgba(255, 255, 255, 0.15)",
                    }}
                >
                    <div className="border-white border border-opacity-100 pb-10 pt-10 pr-15 pl-15 rounded-lg border-dashed xl:w-large w-small h-norm flex flex-col justify-center items-center">
                        <input
                            type="file"
                            className="hidden"
                            id="file-input"
                            onChange={fileChange}
                            accept="audio/*"
                        ></input>
                        {!uploaded && (
                            <span className="flex flex-col justify-center items-center">
                                {!dragging && (
                                    <button
                                        className="bg-violet font-inter rounded-lg pt-4 pb-4 pr-10 pl-10 text-small hover:bg-purple"
                                        id="upload-button"
                                        onClick={uploadFile}
                                    >
                                        Upload file
                                    </button>
                                )}
                                {dragging && (
                                    <FaDownload size={30} color="#252273" />
                                )}
                                <p
                                    className="font-inter text-small mt-1"
                                    style={{
                                        color: dragging ? "#252273" : "white",
                                    }}
                                >
                                    {dragging
                                        ? "Drop the file here"
                                        : "or drop the file here"}
                                </p>
                            </span>
                        )}
                        {uploaded && (
                            <span
                                onClick={uploadFile}
                                className="hover:cursor-pointer hover:opacity-50 items-center flex justify-center mb-4"
                            >
                                <div className="truncate max-w-small xl:max-w-large sm:max-w-medium whitespace-nowrap overflow-hidden">
                                    <p className="truncate font-inter text-center">
                                        ♫ {file}
                                    </p>
                                </div>
                            </span>
                        )}

                        {uploaded && !loading && (
                            <span>
                                <button
                                    className="relative inline-flex h-12 overflow-hidden rounded-lg p-[1px]"
                                    onClick={startGenerating}
                                >
                                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                    <span className="font-inter inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-violet hover:bg-purple px-6 py-2 text-sm font-medium text-white backdrop-blur-3xl">
                                        Generate
                                    </span>
                                </button>
                            </span>
                        )}
                    </div>
                </motion.div>
            )}
            {loading && (
                <span className="w-full">
                    <Progress
                        color="green"
                        style={{ height: "20px", marginTop: "10px" }}
                    />
                    <p className="font-inter text-small text-center text-white mt-5">Loading...</p>
                </span>
            )}
            {finish && (
                <button
                    className="relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] mt-5 max-w-small"
                    onClick={showResults}
                >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="font-inter inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-violet hover:bg-purple px-6 py-2 text-sm font-medium text-white backdrop-blur-3xl">
                        Show Results
                    </span>
                </button>
            )}
        </div>
    );
};

export default Upload;