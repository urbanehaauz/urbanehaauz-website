import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');

// For better performance
Config.setConcurrency(2);

// Output settings
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
