import c4d
import random
from OSC import OSCServer
import sys
from time import sleep
import threading

server = 0;
st = 0;
spheres = []
pivot = 0
objNull = 0
needToAdd = 0

def initOSCServer(ip='localhost', port=8911) :
    print "---server"
    print server;
    global server, st
    server = OSCServer( (ip ,port) ) # basic
    server.addDefaultHandlers()
    print server
    
        
def startOSCServer() :
    print "Registered Callback-functions are :"
    for addr in server.getOSCAddressSpace():
        print addr
    st = threading.Thread( target = server.serve_forever )
    st.start()
    
def printing_handler(addr, tags, data, source):
    print "---"
##    print "received new osc msg from %s" % getUrlStr(source)
    print "with addr : %s" % addr
    print "typetags :%s" % tags
    print "the actual data is : %s" % data
    print "---"
    
def setOSCHandler(address="/print", hd=printing_handler) :
    server.addMsgHandler(address, hd) # adding our function
    
def checkcheckcheck(addr, tags, data, source):
    print "CHECK CHECK CHECK..."
    print "with addr : %s" % addr
    print "typetags :%s" % tags
    print "the actual data is : %s" % data
    
def updateParticlePosition(addr, tags, data, source) :
    s = data[0]
    tmp = [float(x) for x in s.split()]
    
    off = c4d.Vector(tmp[0], tmp[1], tmp[2]);
    v1 = c4d.Vector(tmp[3], tmp[4], tmp[5]);
    v2 = c4d.Vector(tmp[6], tmp[7], tmp[8]);
    v3 = c4d.Vector(tmp[9], tmp[10], tmp[11]);
    
    mtx = c4d.Matrix(off,v1,v2,v3)
    
    index = int(tmp[12])
    
    print "index", index, off, objNull
    
    
    sphere = spheres[index]
    sphere.SetRelMl(mtx)
    
def onFinish(addr, tags, data, source):
    print "Finished"
        #doc.InsertObject(objNull)
    
    
def onUpdate(addr, tags, data, source):
    c4d.EventAdd()
    pivot = 0

def closeOSC() :
    if server is not 0: server.close() 
    if st is not 0: st.join()
    
def exit():
    print "Exit program", server

def main():
    global objNull
    objNull = c4d.BaseObject(c4d.Onull);
    clone = op[c4d.ID_USERDATA, 1]
    
    print clone
    i = 0
    radius = 3
    for i in range(0, 4096):
        sphere = c4d.BaseObject(c4d.Oinstance)
        sphere[c4d.INSTANCEOBJECT_LINK] = clone
        sphere[c4d.INSTANCEOBJECT_RENDERINSTANCE] = True
        s = 1.5
        sphere.InsertUnder(objNull)
        objNull.SetRelPos(c4d.Vector(0, 0, 0))
       
        
        spheres.append(sphere)
    
    print len(spheres)
    
    global needToAdd
    if needToAdd < 1 :
        print "Add to Stage"
        needToAdd = 2
        doc.InsertObject(objNull)
    
    
    closeOSC();
    initOSCServer()
    
    setOSCHandler('/check', checkcheckcheck)
    setOSCHandler('/positions', updateParticlePosition)
    setOSCHandler('/update', onUpdate)
    setOSCHandler('/finish', onFinish)
    startOSCServer()
    
    return objNull

exit();