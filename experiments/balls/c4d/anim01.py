import c4d
import helpers


def main():
    obj = doc.SearchObject('Cube')
    print "Object : ", obj
    
    fps = doc.GetFps()
    start = doc.GetMinTime().GetFrame(fps)  #set min time
    until = doc.GetMaxTime().GetFrame(fps) #set max time
    
    time = c4d.BaseTime(0, fps)
    v = c4d.Vector(0, 0, 0) 
    obj.SetRelPos(v)
    helpers.addKey(obj, c4d.ID_BASEOBJECT_REL_POSITION)
    
    time = c4d.BaseTime(20, fps)
    print "Time", time
    doc.SetTime(time)

    v = c4d.Vector(100, 0, 0) 
    obj.SetRelPos(v)
    helpers.addKey(obj, c4d.ID_BASEOBJECT_REL_POSITION)
    c4d.EventAdd()