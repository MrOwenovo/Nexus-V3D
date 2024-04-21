function [RRIV,t_perbeat,ECGTimeLoaction]=ECGpeaks(file_name,starting,ending)
file_name='3.json';
starting=42930;
ending=46930;
addpath('C:\Program Files\MATLAB\R2021a\toolbox\jsonlab-master')
patient=loadjson(file_name); 

ECGsignal=patient.data_ECG;
ECGsignal=ECGsignal/1000;
dataLength=length(ECGsignal);
selected_data=starting:ending;

Fs=1000;
% Fs=500;
time=dataLength/Fs;
time_scale=1/1000:1/1000:time;
duration=(ending-starting)/Fs;

% 
% plot(time_scale(selected_data),ECGsignal(selected_data));
% xlabel('Time(s)');ylabel('Voltage(mV)');grid




%buttworth low pass filter
fp=80;fs=100;                    %通带截止频率，阻带截止频率
rp=1.4;rs=1.6;                    %通带、阻带衰减
wp=2*pi*fp;ws=2*pi*fs;
[n,wn]=buttord(wp,ws,rp,rs,'s');     %'s'是确定巴特沃斯模拟滤波器阶次和3dB截止模拟频率
n
[z,P,k]=buttap(n);   %设计归一化巴特沃斯模拟低通滤波器，z为极点，p为零点和k为增益
[bp,ap]=zp2tf(z,P,k);  %转换为Ha(p),bp为分子系数，ap为分母系数
[bs,as]=lp2lp(bp,ap,wp); %Ha(p)转换为低通Ha(s)并去归一化，bs为分子系数，as为分母系数

[hs,ws]=freqs(bs,as);         %模拟滤波器的幅频响应
[bz,az]=bilinear(bs,as,Fs);     %对模拟滤波器双线性变换
[h1,w1]=freqz(bz,az);         %数字滤波器的幅频响应
m1=filtfilt(bz,az,ECGsignal(selected_data));

% 
% figure
% freqz(bz,az);title('巴特沃斯低通滤波器幅频曲线');
%       
% figure
% plot(time_scale(selected_data),ECGsignal(selected_data));
% xlabel('t(s)');ylabel('mv');grid
% hold on
% plot(time_scale(selected_data),m1);
% xlabel('t(s)');ylabel('mv');
% legend('Original signal','After low pass fliter');   
% N=512
% n=0:N-1;
% mf=fft(M(1:6000),N);               %进行频谱变换（傅里叶变换）
% mag=abs(mf);
% f=(0:length(mf)-1)*Fs/length(mf);  %进行频率变换
% 
% figure
% subplot(2,1,1)
% plot(f,mag);axis([0,1500,1,50]);grid;      %画出频谱图
% xlabel('频率(HZ)');ylabel('幅值');title('心电信号频谱图');
% 
% mfa=fft(m,N);                    %进行频谱变换（傅里叶变换）
% maga=abs(mfa);
% fa=(0:length(mfa)-1)*Fs/length(mfa);  %进行频率变换
% subplot(2,1,2)
% plot(fa,maga);axis([0,1500,1,50]);grid;  %画出频谱图
% xlabel('频率(HZ)');ylabel('幅值');title('低通滤波后心电信号频谱图');
%     
% wn=M(1:6000);
% P=10*log10(abs(fft(wn).^2)/N);
% f=(0:length(P)-1)/length(P);
% figure
% plot(f,P);grid
% xlabel('归一化频率');ylabel('功率(dB)');title('心电信号的功率谱');

Me=100;               %滤波器阶数
L=100;                %窗口长度
beta=100;             %衰减系数
Fs=1500;
wc1=49/Fs*pi;     %wc1为高通滤波器截止频率，对应51Hz
wc2=51/Fs*pi     ;%wc2为低通滤波器截止频率，对应49Hz
h=ideal_lp(0.132*pi,Me)-ideal_lp(wc1,Me)+ideal_lp(wc2,Me); %h为陷波器冲击响应
w=kaiser(L,beta);
y=h.*rot90(w);         %y为50Hz陷波器冲击响应序列
m2=filtfilt(y,1,m1);

% figure
% subplot(2,1,1);plot(abs(h));axis([0 100 0 0.2]);
% xlabel('频率(Hz)');ylabel('幅度(mv)');title('陷波器幅度谱');grid;
% N=512;
% P=10*log10(abs(fft(y).^2)/N);
% f=(0:length(P)-1);
% subplot(2,1,2);plot(f,P);
% xlabel('频率(Hz)');ylabel('功率(dB)');title('陷波器功率谱');grid;
%    
% figure
% plot(time_scale(selected_data),m1);
% xlabel('t(s)');ylabel('mV');grid;
% hold on
% plot(time_scale(selected_data),m2);
% xlabel('t(s)');ylabel('mV');
% legend('S1','Signal after notch fliter');   
% figure
% N=512
% subplot(2,1,1);plot(abs(fft(m))*2/N);axis([0 100 0 1]);
% xlabel('t(s)');ylabel('幅值');title('原始信号频谱');grid;
% subplot(2,1,2);plot(abs(fft(m2))*2/N);axis([0 100 0 1]);
% xlabel('t(s)');ylabel('幅值');title('带阻滤波后信号频谱');grid;  


[b,a] = butter(8, 0.01, 'low');   %配置滤波器 8 表示滤波器的阶数
ecg_outline_data = filtfilt(b, a, m2);  %m2为要过滤的信号
ECGflited = m2 - ecg_outline_data;

% figure
% plot(time_scale(selected_data),m2); 
% xlabel('t(s)');ylabel('mV');grid
% hold on
% plot(time_scale(selected_data),ECGflited); 
% legend('S2','Signal after normed');  
% % figure

wt = modwt(ECGflited,5);
wtrec = zeros(size(wt));
wtrec(4:5,:) = wt(4:5,:);
y = imodwt(wtrec,'sym4');

abs_y=abs(y);
mean_abs_y=mean(abs_y);

[peaks,ECGTimeLoaction] = findpeaks(y,time_scale(selected_data),'MinPeakHeight',mean_abs_y,...
    'MinPeakDistance',0.15);

% figure
% plot(time_scale(selected_data),y)
% hold on
% plot(TimeLoaction,peaks,'ro')
% xlabel('Seconds')
% title('R Peaks Localized by Wavelet Transform with Automatic Annotations')

arg_peaks=mean(peaks);
arg_sqr_peaks=abs(arg_peaks).^2;
% y = abs(y).^2;
[qrspeaks,ECGTimeLoaction] = findpeaks(y,time_scale(selected_data),'MinPeakHeight',arg_peaks/1.5,...
    'MinPeakDistance',0.1);

% figure
% plot(time_scale(selected_data),y)
% hold on
% plot(TimeLoaction,qrspeaks,'ro')
% xlabel('Seconds')

DataLocation=ECGTimeLoaction*1000;
DataLocation=int64(DataLocation);
DataLocation=DataLocation-starting;
a=ECGflited(DataLocation);
avg_a=mean(a);

% figure
% plot(time_scale(selected_data),ECGflited); 
% xlabel('Seconds');ylabel('mV')
% hold on
% plot(ECGTimeLoaction,a,'ro'); 


x=DataLocation(1:end-1);
z=DataLocation(2:end);
data_interval=x-z;
RRIV=std(double(abs(data_interval)));
data_interval=[data_interval,0];

% remove the invalid values

ddi=diff(data_interval);
abs_ddi= abs(ddi);
abs_ddi=[0,abs_ddi];
max_diff=200;

ECGTimeLoaction(find(abs_ddi>max_diff &  (data_interval<300|data_interval>1000) & a<avg_a/1.5))=[];

a=ECGflited(int64(ECGTimeLoaction*1000-starting));
b=ECGsignal(int64(ECGTimeLoaction*1000));
ECGTimeLoaction=ECGTimeLoaction(1:end);
% a=a(1:end);
% b=b(1:end);
% 
beats=length(ECGTimeLoaction);
t_perbeat=duration/beats;

figure
plot(time_scale(selected_data),ECGflited);
hold on
plot(time_scale(selected_data),ECGsignal(selected_data)); 
hold on


% plot(ECGTimeLoaction,a,'ro')

title('ECG')
xlabel('Seconds');ylabel('mV')
legend('processed ECG','original ECG')

% 
% hold on
% plot(TimeLoaction,a,'ro')
% legend('original signal','annotation after error checking','normalized signal');  
end


