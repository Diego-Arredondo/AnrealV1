# Este código es para acortar el video, poner los puntos clave y la resolución de este


# importing the necessary libraries
from tkinter.font import families
import cv2
import numpy as np
import os
import sys

from fractions import Fraction 
 

class FileCheck():
    def __init__(self, file_dir):
        self.file_dir = file_dir

    def get_filesize(self):
        # get the file size
        file_byte = os.path.getsize(self.file_dir)
        return self.sizeConvert(file_byte)

    def bit_rate(self, n_frames, fps):
        # get the file size
        file_byte = os.path.getsize(self.file_dir)   

        f_rate = (file_byte * 8 * fps)/n_frames

        if f_rate >= 1000000000:
            return str(round((f_rate /1000000000), 2)) + ' GBit/s'
        elif f_rate >= 1000000:
            return str(round((f_rate / 1000000), 2)) + ' MBit/s'
        elif f_rate >= 1000:
            return str(round((f_rate / 1000), 2)) + ' kBit/s'
        else:
            return str(f_rate) + 'Bit/s'

            

    def sizeConvert(self, size):
        # size convert
        K, M, G = 1024, 1024 ** 2, 1024 ** 3
        if size >= G:
            return str(round((size / G), 2)) + ' Gigga Bytes'
        elif size >= M:
            return str(round((size / M), 2)) + ' Mega Bytes'
        elif size >= K:
            return str(round((size / K), 2)) + ' Kilo Bytes'
        else:
            return str(size) + 'Bytes'
    



def croping(cap, output_file, percentt):

    print('START CROPPING')
    aux = 0

    write = True
    percent = percentt/100
    h1 = 1920 - 2 * int(percent*(1920 - 480)) - 480
    w1 = 1080 - 2 * int(percent*1080)
    print(h1)
    print(w1)
    out = cv2.VideoWriter(output_file,
                            cv2.VideoWriter_fourcc(*'M4S2'),
                            30,
                            (h1, w1)) #(480, 256)) (1920, 1080))

    # Loop until the end of the video
    while (cap.isOpened()):

        # Capture frame-by-frame
        ret, frame = cap.read()

        if (not ret):
            break
        
        hh, ww, _ = frame.shape  
 
        #print(frame.shape)
        cropped_image = frame[:, 240:(ww-240)]
        hh, ww, _ = cropped_image.shape 
        #print(cropped_image.shape)
        percent = percentt/100
        cropped_image = cropped_image[int(percent*hh) : hh - int(percent*hh), int(percent*ww): ww - int(percent*ww)]

        #print(cropped_image.shape)
        if cv2.waitKey(50) & 0xFF == ord('e'):
            print('e')
            break

        # hh, ww, _ = cropped_image.shape  
        # cropped_image = cropped_image[:, 90:(ww-90)]    

        if aux == 0:
            print('***Original dimension***  ' + str(frame.shape) +'. Ratio of: '+ str(Fraction(frame.shape[1],frame.shape[0])))
            print('***Cropped dimension***  ' + str(cropped_image.shape) +'. Ratio of: '+ str(Fraction(cropped_image.shape[1],cropped_image.shape[0])))
        aux += 1


        if write:
            out.write(cropped_image)


    # release the video capture object
    cap.release()
    # Closes all the windows currently opened.
    cv2.destroyAllWindows()

    return aux+1, cropped_image.shape



def cortar_video(cap, output_file, h, w):

    print('START CUTTING')
    keypoints = []
    aux = 0
    aux2 = 0
    write = False
    contador_frames = 0
    autorizacion_contador = False
    imshow = True
    # Loop until the end of the video
    
    out = cv2.VideoWriter(output_file,
                            cv2.VideoWriter_fourcc(*'M4S2'),
                            30,
                            (h, w)) #(480, 360)) 

    frame_list = []
    while (cap.isOpened()):

        # Capture frame-by-frame
        ret, frame = cap.read()

        

        if (not ret):
            break
        frame = cv2.resize(frame, (h, w), fx = 0, fy = 0,
                            interpolation = cv2.INTER_CUBIC)

        if imshow:
            # Display the resulting frame
            cv2.imshow('Frame', frame)

        if cv2.waitKey(50) & 0xFF == ord('c'):
            print('c')
            autorizacion_contador = True      
       
        if cv2.waitKey(50) & 0xFF == ord('q'):
            print('q')
            keypoints.append(aux)
            autorizacion_contador = False
            write = True
            imshow = False
            # Closes all the windows currently opened.
            cv2.destroyAllWindows()

        if cv2.waitKey(50) & 0xFF == ord('e'):
            print('e')
            break

        aux += 1

        if autorizacion_contador:
            contador_frames += 1

        if write:
            if aux2 == 0:
                print("wrinting zeroosss")
                out.write(np.zeros((w,h,3), np.uint8))
            out.write(frame)
            frame_list.append(frame)
            aux2 += 1


    # release the video capture object
    cap.release()


    frame_list.pop()
    frame_list.reverse()

    for frame in frame_list:
        out.write(frame)

    return keypoints, contador_frames

def cortar_video_2(cap, output_file, h, w, contador_frames):

    print('START CUTTING')
    keypoints = []
    aux = 0
    aux2 = 0
    contador = 0
    write = False
    habilitar_contador = False
    imshow = True
    # Loop until the end of the video
    
    out = cv2.VideoWriter(output_file,
                            cv2.VideoWriter_fourcc(*'M4S2'),
                            30,
                            (h, w)) #(480, 360)) 

    frame_list = []
    while (cap.isOpened()):

        # Capture frame-by-frame
        ret, frame = cap.read()

        

        if (not ret):
            break
        frame = cv2.resize(frame, (h, w), fx = 0, fy = 0,
                            interpolation = cv2.INTER_CUBIC)

        if imshow:
            # Display the resulting frame
            cv2.imshow('Frame', frame)

        if cv2.waitKey(50) & 0xFF == ord('c'):
            print('c')
            imshow = False
            habilitar_contador = True   
            # Closes all the windows currently opened.
            cv2.destroyAllWindows() 
       

        if cv2.waitKey(50) & 0xFF == ord('e'):
            print('e')
            break

        aux += 1

        if habilitar_contador:
            contador += 1
            if contador == contador_frames:
                write = True

        if write:
            if aux2 == 0:
                print("wrinting zeroosss")
                out.write(np.zeros((w,h,3), np.uint8))
            out.write(frame)
            frame_list.append(frame)
            aux2 += 1
        



    # release the video capture object
    cap.release()


    frame_list.pop()
    frame_list.reverse()

    for frame in frame_list:
        out.write(frame)



if __name__ == "__main__":
    # Creating a VideoCapture object to read the video
    input_name = "alto.mp4"
    input_dir = '/home/diegodinho/Documentos/Escritorio/Magister/ProcesamientoVideo/videos'
    mid_dir = '/home/diegodinho/Documentos/Escritorio/Magister/ProcesamientoVideo/weas/pruebas_video/crop'
    output_dir = '/home/diegodinho/Documentos/Escritorio/Magister/Desarrollo App/React Native/Principal/src/media/videos'

    name = "wena.mp4"

    cap = cv2.VideoCapture(input_dir + '/' + input_name)

    mid_file = mid_dir + '/' + name 
    numer_of_frames, shape = croping(cap, mid_file, percentt = 10)
    cap = cv2.VideoCapture(mid_file)
    output_file = output_dir + '/' + name 
    keypoints, contador_frames = cortar_video(cap, output_file, shape[1], shape[0])
    print(keypoints)

    res = FileCheck(input_dir + '/' + input_name)
    res1 = res.get_filesize()
    fr = res.bit_rate(n_frames=numer_of_frames,fps=30)
    print('***Original video size***: ' + res1 + '. Bit rate: ' + fr)
    res2 = FileCheck(output_file)
    res21 = res2.get_filesize()
    fr2 = res2.bit_rate(n_frames=numer_of_frames,fps=30)
    print('***Final video size***: ' + res21+ '. Bit rate: ' + fr2)

    # videos = os.listdir(input_dir)
    # videos.sort()
    # print(f"The input videos are: ")
    # print(videos)
    
    # for index, video in enumerate(videos):
        
    #     print(f'El video es {video}')
    #     name = '0' + str(index +1) + '.mp4'
        
    #     if index == 0:
    #         cap = cv2.VideoCapture(input_dir + '/' + video)

    #         mid_file = mid_dir + '/' + name 
    #         numer_of_frames, shape = croping(cap, mid_file, percentt = 10)
    #         cap = cv2.VideoCapture(mid_file)
    #         output_file = output_dir + '/' + name 
    #         keypoints, contador_frames = cortar_video(cap, output_file, shape[1], shape[0])
    #         print(keypoints)

    #         res = FileCheck(input_dir + '/' + video)
    #         res1 = res.get_filesize()
    #         fr = res.bit_rate(n_frames=numer_of_frames,fps=30)
    #         print('***Original video size***: ' + res1 + '. Bit rate: ' + fr)
    #         res2 = FileCheck(output_file)
    #         res21 = res2.get_filesize()
    #         fr2 = res2.bit_rate(n_frames=numer_of_frames,fps=30)
    #         print('***Final video size***: ' + res21+ '. Bit rate: ' + fr2)
        
    #     else:

    #         cap = cv2.VideoCapture(input_dir + '/' + video)

    #         mid_file = mid_dir + '/' + name 
    #         numer_of_frames, shape = croping(cap, mid_file, percentt = 10)
    #         cap = cv2.VideoCapture(mid_file)
    #         output_file = output_dir + '/' + name 
    #         cortar_video_2(cap, output_file, shape[1], shape[0], contador_frames)

    #         res = FileCheck(input_dir + '/' + video)
    #         res1 = res.get_filesize()
    #         fr = res.bit_rate(n_frames=numer_of_frames,fps=30)
    #         print('***Original video size***: ' + res1 + '. Bit rate: ' + fr)
    #         res2 = FileCheck(output_file)
    #         res21 = res2.get_filesize()
    #         fr2 = res2.bit_rate(n_frames=numer_of_frames,fps=30)
    #         print('***Final video size***: ' + res21+ '. Bit rate: ' + fr2)    



    