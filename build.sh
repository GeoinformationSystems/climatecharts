#!/bin/bash

###############################################################################
# PATH VARIABLES
###############################################################################

readonly SOURCE_PATH="source/modules"
readonly THIRD_PARTY_PATH="source/third-party"
readonly BUILD_PATH="build"


###############################################################################
# CLEAR THE BUILD FOLDER (safely...)
###############################################################################

# IMPORTANT SECURITY VARIABLE!
# Only empty the build folder if it has less than X files in it
# Reason: If for any reason the script got files from a wrong directory with
# many files it will not delete it!
readonly MAX_NUM_BUILD_FILES=200
readonly MAX_NUM_BUILD_FOLDERS=25

# create build path if it does not exist so far
mkdir -p $BUILD_PATH

# Get full content of the build folder
build_files=`find $BUILD_PATH`

# Count number of files and folders in build folder
num_files=0
num_folders=0
for file in $build_files; do
  if    [ -d "${file}" ] ; then
    let "num_folders++"
  elif  [ -f "${file}" ] ; then
    let "num_files++"
  fi
done

echo "Found" $num_files "files and" $num_folders "directories in the build folder."

# Abort if too many files / folders in the build path
if (( $num_files > $MAX_NUM_BUILD_FILES )) ||
   (( $num_folders > $MAX_NUM_BUILD_FOLDERS )) ; then
  echo "ERROR: There are too many files or folders in the build folder!"
  echo "The path to the build folder is probably not correct."
  exit 0
fi

# If the script made it all the way to here, it is probably safe to empty the
# build folder => Do it!!!
if (( $num_files > 0 )) && (( $num_folders > 0 )) ; then
  build_file_list=($build_files)
  # delete build path
  rm ${build_file_list[0]} -r
  # recreate build path
  mkdir -p $BUILD_PATH
fi


###############################################################################
# POPULATE THE BUILD FOLDER
###############################################################################

# Get own module files:

# ## *.js: compile ECMA6 -> ECMA5 with babel
js_files=$(find $SOURCE_PATH -name "*.js")
babel --presets=es2015 $js_files -d $BUILD_PATH

## *.css: simply copy
css_files=$(find $SOURCE_PATH -name "*.css")
cp $css_files $BUILD_PATH --parents -r

# Third-party libs (js and css files): Copy everything
third_party_files=$(find $THIRD_PARTY_PATH)
cp $third_party_files $BUILD_PATH --parents -r

# restructure the build folder
# current structure:  build/source/modules/...  build/source/third-party/...
# desired structure:  build/modules/...         build/third-party/...
# => go into build folder and move everything one level of hierarchy down
mv $BUILD_PATH/source/* $BUILD_PATH
rm $BUILD_PATH/source -R
